'use client'

import { useState, useEffect, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { useCvStore } from '@/store/cvStore'
import { CVParsedData } from '@/types'
import { Button } from '@/components/ui/button'
import { parseCVDescription } from '@/utils/cvFormatter'

export default function CVPage() {
  const { 
    cvUrl, 
    cvParsed, 
    isUploading, 
    isProcessing,
    isLoading, 
    error,
    fetchMyCv,
    uploadCv,
    updateCvData,
    reprocessCv,
    deleteCv,
    setError
  } = useCvStore()

  const [isEditing, setIsEditing] = useState(false)
  const [editData, setEditData] = useState<Partial<CVParsedData>>({})

  useEffect(() => {
    fetchMyCv()
  }, [fetchMyCv])

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (file) {
      uploadCv(file)
    }
  }, [uploadCv])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png']
    },
    maxSize: 10 * 1024 * 1024,
    multiple: false,
    disabled: isUploading || isProcessing
  })

  const handleStartEdit = () => {
    setEditData(cvParsed || {})
    setIsEditing(true)
  }

  const handleSaveEdit = async () => {
    await updateCvData(editData)
    setIsEditing(false)
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      <div className="mb-12">
        <h1 className="text-[28px] font-bold text-foreground tracking-tight mb-2">Professional Resume</h1>
        <p className="text-muted font-normal text-lg">
          Upload your resume and let our intelligent engine extract your career profile for optimized job matching.
        </p>
      </div>

      {error && (
        <div className="mb-10 p-6 bg-rose-50 border border-rose-100 text-rose-700 rounded-2xl flex items-center gap-4 animate-fade-in">
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <span className="font-bold text-sm">{error}</span>
          <button onClick={() => setError(null)} className="ml-auto p-2 hover:bg-rose-100 rounded-full transition-colors">
            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Upload Column */}
        <div className="lg:col-span-1 space-y-8">
          <div className="card border border-border bg-white shadow-sm p-8 lg:p-10">
            <h3 className="text-sm font-bold text-foreground uppercase tracking-wider mb-6">Manage Resume</h3>
            
            <div
              {...getRootProps()}
              className={`relative group cursor-pointer border-2 border-dashed rounded-3xl p-10 transition-all ${
                isDragActive 
                ? 'border-primary bg-primary/5' 
                : 'border-border hover:border-primary/50 hover:bg-accent/30'
              }`}
            >
              <input {...getInputProps()} />
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-accent text-muted group-hover:bg-primary group-hover:text-white transition-all mb-6">
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                </div>
                <p className="text-sm font-bold text-foreground">
                  {isUploading ? 'Uploading...' : isDragActive ? 'Drop resume here' : 'Select resume file'}
                </p>
                <p className="text-xs text-muted font-medium mt-2">PDF, DOCX up to 10MB</p>
              </div>
              
              {isUploading && (
                <div className="absolute inset-0 bg-white/60 backdrop-blur-sm flex items-center justify-center rounded-3xl">
                  <div className="loading-spinner h-8 w-8"></div>
                </div>
              )}
            </div>

            {cvUrl && (
              <div className="mt-8 space-y-4">
                <a 
                  href={cvUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-4 p-4 bg-accent/30 rounded-2xl hover:bg-accent transition-all group border border-border"
                >
                  <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center text-primary border border-border shadow-sm">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-foreground truncate">My current resume</p>
                    <p className="text-[10px] text-muted font-bold uppercase tracking-wider">Open original file</p>
                  </div>
                </a>

                <div className="grid grid-cols-2 gap-3">
                  <Button 
                    onClick={() => reprocessCv()}
                    disabled={isProcessing}
                    variant="outline"
                    size="sm"
                    className="h-11 text-[10px] font-bold uppercase tracking-wider"
                  >
                    <svg className={`w-3 h-3 mr-2 ${isProcessing ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Analyze
                  </Button>
                  <Button 
                    onClick={() => { if(confirm('Delete your CV?')) deleteCv() }}
                    variant="ghost"
                    size="sm"
                    className="h-11 text-[10px] font-bold uppercase tracking-wider text-rose-500 hover:text-rose-600 hover:bg-rose-50"
                  >
                    Delete
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Parsed Info Column */}
        <div className="lg:col-span-2 space-y-8">
          <div className="card border border-border bg-white shadow-sm overflow-hidden !p-0">
            <div className="px-10 py-8 border-b border-border flex items-center justify-between">
              <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">Career Insight Profile</h3>
              {!isEditing && cvParsed && (
                <button 
                  onClick={handleStartEdit}
                  className="text-xs font-bold text-primary hover:text-[#008489] transition-colors"
                >
                  Edit profile
                </button>
              )}
            </div>

            <div className="p-10">
              {isLoading || isProcessing ? (
                <div className="flex flex-col items-center justify-center py-20">
                  <div className="loading-spinner h-10 w-10 mb-6"></div>
                  <p className="text-muted font-bold uppercase tracking-widest text-[10px]">Processing resume details...</p>
                </div>
              ) : cvParsed ? (
                isEditing ? (
                  <div className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-2">
                        <label className="form-label ml-1">Full Name</label>
                        <input 
                          value={editData.name || ''} 
                          onChange={e => setEditData({...editData, name: e.target.value})}
                          className="input w-full"
                          placeholder="e.g. Alex Johnson"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="form-label ml-1">Email</label>
                        <input 
                          value={editData.email || ''} 
                          onChange={e => setEditData({...editData, email: e.target.value})}
                          className="input w-full"
                          placeholder="e.g. alex@example.com"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="form-label ml-1">Skills (comma separated)</label>
                      <input 
                        value={editData.skills?.join(', ') || ''} 
                        onChange={e => setEditData({...editData, skills: e.target.value.split(',').map(s => s.trim())})}
                        className="input w-full"
                        placeholder="e.g. TypeScript, Design Systems, AWS"
                      />
                    </div>
                    <div className="flex gap-4 pt-6">
                      <Button 
                        onClick={handleSaveEdit}
                        variant="primary"
                        className="flex-1 h-12 text-sm font-bold"
                      >
                        Save changes
                      </Button>
                      <Button 
                        onClick={() => setIsEditing(false)}
                        variant="outline"
                        className="px-10 h-12 text-sm font-bold"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-12">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                      <div>
                        <p className="text-[10px] font-bold text-muted uppercase tracking-wider mb-2">Name</p>
                        <p className="text-xl font-bold text-foreground">{cvParsed.name || 'Not detected'}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-muted uppercase tracking-wider mb-2">Email</p>
                        <p className="text-xl font-bold text-foreground truncate">{cvParsed.email || 'Not detected'}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-muted uppercase tracking-wider mb-2">Phone</p>
                        <p className="text-xl font-bold text-foreground">{cvParsed.phone || 'Not detected'}</p>
                      </div>
                    </div>

                    <div>
                      <p className="text-[10px] font-bold text-muted uppercase tracking-[0.2em] mb-6">Expertise & Technologies</p>
                      <div className="flex flex-wrap gap-2 max-h-[220px] overflow-y-auto custom-scrollbar pr-4">
                        {cvParsed.skills && cvParsed.skills.length > 0 ? (
                          cvParsed.skills.map((skill: string, i: number) => (
                            <span key={i} className="px-3.5 py-2 rounded-xl bg-primary/5 text-primary text-[11px] font-bold border border-primary/10 hover:bg-primary hover:text-white transition-all duration-300 cursor-default whitespace-nowrap">
                              {skill}
                            </span>
                          ))
                        ) : (
                          <p className="text-sm text-muted font-medium italic">No expertise detected</p>
                        )}
                      </div>
                    </div>

                    <div>
                      <p className="text-[10px] font-bold text-muted uppercase tracking-[0.2em] mb-8">Professional Journey</p>
                      <div className="space-y-12 relative">
                        <div className="absolute left-[7px] top-2 bottom-0 w-[2px] bg-accent/50"></div>
                        {cvParsed.experience && cvParsed.experience.length > 0 ? (
                          cvParsed.experience.map((exp: any, i: number) => (
                            <div key={i} className="relative pl-10 group">
                              <div className="absolute left-0 top-[6px] w-4 h-4 rounded-full bg-white border-4 border-primary shadow-sm ring-4 ring-primary/5 group-hover:scale-125 transition-transform"></div>
                              <div className="space-y-2">
                                <h4 className="text-xl font-bold text-foreground tracking-tight group-hover:text-primary transition-colors break-words">{exp.title}</h4>
                                <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                                  <p className="text-sm font-bold text-primary/80">{exp.company}</p>
                                  <div className="flex items-center gap-2">
                                    <span className="w-1 h-1 rounded-full bg-muted/30"></span>
                                    <p className="text-[10px] font-bold text-muted uppercase tracking-wider whitespace-nowrap">{exp.period}</p>
                                  </div>
                                </div>
                                {exp.description && (
                                  <div className="mt-4 p-8 bg-accent/20 rounded-3xl border border-border/30 relative overflow-hidden">
                                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary/20"></div>
                                    <div className="space-y-4">
                                      {parseCVDescription(exp.description).map((block, idx) => {
                                        if (block.type === 'header') {
                                          return (
                                            <div key={idx} className="mt-8 first:mt-0">
                                              <p className="text-foreground font-bold uppercase tracking-wider text-[11px] mb-2">
                                                {block.text}
                                              </p>
                                              <div className="h-px w-10 bg-primary/30"></div>
                                            </div>
                                          )
                                        }
                                        
                                        if (block.type === 'list-item') {
                                          return (
                                            <div key={idx} className="flex gap-3 pl-2 group/item">
                                              <span className="text-primary mt-1.5 opacity-40 group-hover/item:opacity-100 transition-opacity text-[10px]">●</span>
                                              <span className="flex-1 text-slate-600 leading-relaxed text-[13px]">{block.text}</span>
                                            </div>
                                          )
                                        }
                                        
                                        return (
                                          <p key={idx} className="pl-5 text-slate-600 leading-relaxed text-[13px] font-medium">
                                            {block.text}
                                          </p>
                                        )
                                      })}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          ))
                        ) : (
                          <p className="text-sm text-muted font-medium italic pl-10">No experience records detected</p>
                        )}
                      </div>
                    </div>
                  </div>
                )
              ) : (
                <div className="text-center py-20">
                  <div className="w-20 h-20 rounded-full bg-accent flex items-center justify-center text-muted mx-auto mb-6 shadow-sm border border-border">
                    <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h4 className="text-xl font-bold text-foreground">Awaiting Data</h4>
                  <p className="text-muted mt-2 font-medium">Upload your career records to build your intelligent platform profile.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
