import tensorflow as tf
from tensorflow.keras import layers, models, optimizers
import numpy as np
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
import pickle
import os
import logging
from typing import Tuple, Dict, List

logger = logging.getLogger(__name__)

class CVJobMatcher:
    """TensorFlow model for CV-Job matching"""
    
    def __init__(self, model_path: str = "app/model/saved_model"):
        self.model_path = model_path
        self.model = None
        self.tfidf_vectorizer = None
        self.scaler = None
        self.feature_names = []
        
        # Create model directory if it doesn't exist
        os.makedirs(model_path, exist_ok=True)
    
    def prepare_data(self, cv_data: List[Dict], job_data: List[Dict], 
                    labels: List[float]) -> Tuple[np.ndarray, np.ndarray]:
        """
        Prepare training data from CV and job data
        
        Args:
            cv_data: List of CV dictionaries
            job_data: List of job dictionaries  
            labels: List of match scores (0-1)
            
        Returns:
            Tuple of (features, labels) as numpy arrays
        """
        try:
            # Extract text features from CV and job data
            cv_texts = []
            job_texts = []
            
            for cv in cv_data:
                cv_text = self._extract_cv_features(cv)
                cv_texts.append(cv_text)
            
            for job in job_data:
                job_text = self._extract_job_features(job)
                job_texts.append(job_text)
            
            # Create combined features
            combined_texts = []
            for cv_text, job_text in zip(cv_texts, job_texts):
                combined_text = f"{cv_text} [SEP] {job_text}"
                combined_texts.append(combined_text)
            
            # TF-IDF Vectorization
            if self.tfidf_vectorizer is None:
                self.tfidf_vectorizer = TfidfVectorizer(
                    max_features=5000,
                    ngram_range=(1, 2),
                    stop_words='english',
                    lowercase=True,
                    min_df=2,
                    max_df=0.8
                )
                features = self.tfidf_vectorizer.fit_transform(combined_texts)
            else:
                features = self.tfidf_vectorizer.transform(combined_texts)
            
            # Convert to dense array
            features_array = features.toarray()
            
            # Add numerical features
            numerical_features = self._extract_numerical_features(cv_data, job_data)
            
            # Combine TF-IDF and numerical features
            if numerical_features.shape[1] > 0:
                if self.scaler is None:
                    self.scaler = StandardScaler()
                    numerical_features_scaled = self.scaler.fit_transform(numerical_features)
                else:
                    numerical_features_scaled = self.scaler.transform(numerical_features)
                
                features_array = np.hstack([features_array, numerical_features_scaled])
            
            return features_array, np.array(labels)
            
        except Exception as e:
            logger.error(f"Error preparing data: {str(e)}")
            raise
    
    def _extract_cv_features(self, cv: Dict) -> str:
        """Extract text features from CV"""
        features = []
        
        # Add skills
        if cv.get('skills'):
            features.extend(cv['skills'])
        
        # Add experience descriptions
        for exp in cv.get('experience', []):
            if exp.get('description'):
                features.append(exp['description'])
            if exp.get('title'):
                features.append(exp['title'])
            if exp.get('company'):
                features.append(exp['company'])
        
        # Add education
        for edu in cv.get('education', []):
            if edu.get('degree'):
                features.append(edu['degree'])
            if edu.get('school'):
                features.append(edu['school'])
        
        # Add summary
        if cv.get('summary'):
            features.append(cv['summary'])
        
        return ' '.join(features)
    
    def _extract_job_features(self, job: Dict) -> str:
        """Extract text features from job"""
        features = []
        
        # Add title
        if job.get('title'):
            features.append(job['title'])
        
        # Add description
        if job.get('description'):
            features.append(job['description'])
        
        # Add requirements
        for req in job.get('requirements', []):
            features.append(req)
        
        # Add skills
        if job.get('skills'):
            features.extend(job['skills'])
        
        return ' '.join(features)
    
    def _extract_numerical_features(self, cv_data: List[Dict], job_data: List[Dict]) -> np.ndarray:
        """Extract numerical features for matching"""
        features = []
        
        for cv, job in zip(cv_data, job_data):
            cv_features = []
            
            # CV numerical features
            cv_features.append(len(cv.get('skills', [])))  # Number of skills
            cv_features.append(len(cv.get('experience', [])))  # Number of experiences
            cv_features.append(len(cv.get('education', [])))  # Number of education entries
            
            # Job numerical features
            job_features = []
            job_features.append(len(job.get('skills', [])))  # Number of required skills
            job_features.append(len(job.get('requirements', [])))  # Number of requirements
            
            # Combined features
            combined_features = []
            
            # Skills overlap ratio
            cv_skills = set(cv.get('skills', []))
            job_skills = set(job.get('skills', []))
            if len(job_skills) > 0:
                skills_overlap = len(cv_skills & job_skills) / len(job_skills)
            else:
                skills_overlap = 0.0
            combined_features.append(skills_overlap)
            
            # Experience years (simplified)
            exp_years = len(cv.get('experience', []))
            combined_features.append(exp_years)
            
            # Salary features (if available)
            salary_min = job.get('salary_min', 0)
            salary_max = job.get('salary_max', 0)
            combined_features.append(salary_min)
            combined_features.append(salary_max)
            
            # Location match (simplified - binary)
            cv_location = cv.get('location', '').lower()
            job_location = job.get('location', '').lower()
            location_match = 1.0 if cv_location and job_location and cv_location in job_location else 0.0
            combined_features.append(location_match)
            
            all_features = cv_features + job_features + combined_features
            features.append(all_features)
        
        return np.array(features)
    
    def build_model(self, input_shape: int) -> tf.keras.Model:
        """Build the neural network model"""
        try:
            # Input layer
            inputs = layers.Input(shape=(input_shape,))
            
            # Hidden layers
            x = layers.Dense(512, activation='relu')(inputs)
            x = layers.Dropout(0.3)(x)
            x = layers.BatchNormalization()(x)
            
            x = layers.Dense(256, activation='relu')(x)
            x = layers.Dropout(0.3)(x)
            x = layers.BatchNormalization()(x)
            
            x = layers.Dense(128, activation='relu')(x)
            x = layers.Dropout(0.2)(x)
            x = layers.BatchNormalization()(x)
            
            x = layers.Dense(64, activation='relu')(x)
            x = layers.Dropout(0.2)(x)
            
            # Output layer
            outputs = layers.Dense(1, activation='sigmoid')(x)
            
            # Create model
            model = models.Model(inputs=inputs, outputs=outputs)
            
            # Compile model
            model.compile(
                optimizer=optimizers.Adam(learning_rate=0.001),
                loss='binary_crossentropy',
                metrics=['accuracy', 'mse']
            )
            
            return model
            
        except Exception as e:
            logger.error(f"Error building model: {str(e)}")
            raise
    
    def train(self, cv_data: List[Dict], job_data: List[Dict], 
              labels: List[float], validation_split: float = 0.2,
              epochs: int = 100, batch_size: int = 32) -> Dict:
        """
        Train the model
        
        Args:
            cv_data: List of CV dictionaries
            job_data: List of job dictionaries
            labels: List of match scores (0-1)
            validation_split: Fraction of data for validation
            epochs: Number of training epochs
            batch_size: Batch size for training
            
        Returns:
            Training history
        """
        try:
            # Prepare data
            X, y = self.prepare_data(cv_data, job_data, labels)
            
            # Split data
            X_train, X_val, y_train, y_val = train_test_split(
                X, y, test_size=validation_split, random_state=42
            )
            
            # Build model
            self.model = self.build_model(X_train.shape[1])
            
            # Callbacks
            callbacks = [
                tf.keras.callbacks.EarlyStopping(
                    monitor='val_loss', patience=10, restore_best_weights=True
                ),
                tf.keras.callbacks.ReduceLROnPlateau(
                    monitor='val_loss', factor=0.5, patience=5, min_lr=1e-7
                )
            ]
            
            # Train model
            history = self.model.fit(
                X_train, y_train,
                validation_data=(X_val, y_val),
                epochs=epochs,
                batch_size=batch_size,
                callbacks=callbacks,
                verbose=1
            )
            
            # Save model and preprocessors
            self.save_model()
            
            logger.info("Model training completed successfully")
            return history.history
            
        except Exception as e:
            logger.error(f"Error training model: {str(e)}")
            raise
    
    def predict(self, cv_data: Dict, job_data: List[Dict]) -> List[float]:
        """
        Predict match scores for CV against multiple jobs
        
        Args:
            cv_data: CV dictionary
            job_data: List of job dictionaries
            
        Returns:
            List of match scores (0-1)
        """
        try:
            if self.model is None:
                raise ValueError("Model not trained or loaded")
            
            # Prepare data for prediction
            cv_list = [cv_data] * len(job_data)
            X, _ = self.prepare_data(cv_list, job_data, [0.0] * len(job_data))
            
            # Predict
            predictions = self.model.predict(X)
            
            return predictions.flatten().tolist()
            
        except Exception as e:
            logger.error(f"Error predicting: {str(e)}")
            raise
    
    def save_model(self):
        """Save the trained model and preprocessors"""
        try:
            if self.model is not None:
                # Save TensorFlow model
                self.model.save(os.path.join(self.model_path, 'model.h5'))
                
                # Save preprocessors
                if self.tfidf_vectorizer is not None:
                    with open(os.path.join(self.model_path, 'tfidf.pkl'), 'wb') as f:
                        pickle.dump(self.tfidf_vectorizer, f)
                
                if self.scaler is not None:
                    with open(os.path.join(self.model_path, 'scaler.pkl'), 'wb') as f:
                        pickle.dump(self.scaler, f)
                
                logger.info(f"Model saved to {self.model_path}")
            
        except Exception as e:
            logger.error(f"Error saving model: {str(e)}")
            raise
    
    def load_model(self):
        """Load the trained model and preprocessors"""
        try:
            # Load TensorFlow model
            model_path = os.path.join(self.model_path, 'model.h5')
            if os.path.exists(model_path):
                self.model = tf.keras.models.load_model(model_path)
                logger.info("TensorFlow model loaded successfully")
            
            # Load TF-IDF vectorizer
            tfidf_path = os.path.join(self.model_path, 'tfidf.pkl')
            if os.path.exists(tfidf_path):
                with open(tfidf_path, 'rb') as f:
                    self.tfidf_vectorizer = pickle.load(f)
                logger.info("TF-IDF vectorizer loaded successfully")
            
            # Load scaler
            scaler_path = os.path.join(self.model_path, 'scaler.pkl')
            if os.path.exists(scaler_path):
                with open(scaler_path, 'rb') as f:
                    self.scaler = pickle.load(f)
                logger.info("Scaler loaded successfully")
            
            if self.model is None:
                raise ValueError("No trained model found")
                
        except Exception as e:
            logger.error(f"Error loading model: {str(e)}")
            raise
    
    def create_sample_data(self, num_samples: int = 1000) -> Tuple[List[Dict], List[Dict], List[float]]:
        """Create sample training data for testing"""
        try:
            cv_data = []
            job_data = []
            labels = []
            
            # Sample skills
            skills_pool = [
                'python', 'java', 'javascript', 'react', 'nodejs', 'sql', 'mongodb',
                'docker', 'aws', 'machine learning', 'data analysis', 'project management'
            ]
            
            # Sample job titles
            job_titles = [
                'Software Engineer', 'Data Scientist', 'Full Stack Developer',
                'Backend Developer', 'Frontend Developer', 'DevOps Engineer'
            ]
            
            for i in range(num_samples):
                # Generate CV data
                cv_skills = np.random.choice(skills_pool, size=np.random.randint(3, 8), replace=False).tolist()
                cv_experience = [
                    {
                        'title': np.random.choice(job_titles),
                        'company': f'Company {np.random.randint(1, 100)}',
                        'duration': f'{np.random.randint(1, 5)} years',
                        'description': 'Worked on various projects'
                    }
                ]
                
                cv = {
                    'skills': cv_skills,
                    'experience': cv_experience,
                    'education': [{'degree': 'Bachelor', 'school': 'University'}],
                    'location': np.random.choice(['Hanoi', 'Ho Chi Minh', 'Da Nang'])
                }
                
                # Generate job data
                job_skills = np.random.choice(skills_pool, size=np.random.randint(3, 8), replace=False).tolist()
                job = {
                    'title': np.random.choice(job_titles),
                    'description': f'Looking for a skilled professional',
                    'requirements': job_skills[:3],
                    'skills': job_skills,
                    'location': np.random.choice(['Hanoi', 'Ho Chi Minh', 'Da Nang']),
                    'salary_min': np.random.randint(1000, 3000),
                    'salary_max': np.random.randint(3000, 8000)
                }
                
                # Calculate label based on skill overlap
                cv_skills_set = set(cv_skills)
                job_skills_set = set(job_skills)
                overlap = len(cv_skills_set & job_skills_set) / len(job_skills_set)
                label = min(1.0, overlap + np.random.normal(0, 0.1))  # Add some noise
                
                cv_data.append(cv)
                job_data.append(job)
                labels.append(max(0, min(1, label)))  # Ensure label is between 0 and 1
            
            return cv_data, job_data, labels
            
        except Exception as e:
            logger.error(f"Error creating sample data: {str(e)}")
            raise
