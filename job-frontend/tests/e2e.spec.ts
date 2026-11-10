import { test, expect } from '@playwright/test';
import { execSync } from 'child_process';

const candidateEmail = 'candidate_1655@test.com';
const employerEmail = 'employer_1655@test.com';
const adminEmail = 'admin_1655@test.com';
const password = 'Password123';
const jobTitle = 'Kỹ sư Phần mềm Nodejs E2E 1655';

// Test suite is executed sequentially to mock a complete recruitment cycle
test.describe.configure({ mode: 'serial' });

test.describe('JobSync System E2E E2E Automated Browser Tests', () => {
  let candidateUserId = '';
  let employerUserId = '';

  test.beforeAll(async () => {
    console.log('Cleaning and seeding database with test accounts...');
    execSync('node ../job-backend/scratch/clear_test_users.js');
  });

  test('1. Candidate Flow: Registration & Profile Setup', async ({ page }) => {
    // Navigate to registration page
    await page.goto('/auth/register');
    
    // Form Inputs
    await page.fill('#name', 'Candidate E2E');
    await page.fill('#email', candidateEmail);
    await page.fill('#password', password);
    await page.fill('#confirmPassword', password);
    
    // Submit registration
    await page.click('button[type="submit"]');
    
    // Should navigate to dashboard
    await expect(page).toHaveURL(/.*dashboard/);

    // Bypassing file upload via database injection (populate CV URL to enable applying)
    console.log(`Injecting CV URL and skills into candidate profile for ${candidateEmail}...`);
    execSync(`node ../job-backend/scratch/set_cv_url.js ${candidateEmail}`);

    // Update candidate profile bio and location
    await page.goto('/dashboard/profile');
    await page.click('button:has-text("Edit profile")');
    await page.fill('input[placeholder="City, Country"]', 'Da Nang, Viet Nam');
    await page.fill('textarea[placeholder*="yourself"]', 'I am a senior candidate with strong skills in Node.js and React.');
    await page.click('button:has-text("Save changes")');

    // Verify profile updated
    await expect(page.locator('text=Profile updated successfully').first()).toBeVisible();
    
    // Extract candidate User ID from DB
    candidateUserId = execSync(`node ../job-backend/scratch/get_user_id.js ${candidateEmail}`).toString().trim();
    console.log(`Candidate registered with ID: ${candidateUserId}`);
  });

  test('2. Employer Flow: Registration, Profile Setup, and Job Post', async ({ page }) => {
    // Navigate to registration
    await page.goto('/auth/register');
    
    // Select Employer Role (Partner)
    await page.click('button:has-text("Partner")');
    
    // Fill Registration Form
    await page.fill('#name', 'Employer E2E Recruiter');
    await page.fill('#email', employerEmail);
    await page.fill('#password', password);
    await page.fill('#confirmPassword', password);
    await page.click('button[type="submit"]');
    
    // Should navigate to dashboard
    await expect(page).toHaveURL(/.*dashboard/);

    // Update Employer Profile
    await page.goto('/dashboard/profile');
    await page.click('button:has-text("Edit profile")');
    await page.fill('input[placeholder="e.g. Acme Corp"]', 'TechCorp E2E Solutions');
    await page.fill('input[placeholder="https://example.com"]', 'https://techcorp-e2e.example.com');
    await page.fill('input[placeholder="City, Country"]', 'Da Nang, Viet Nam');
    await page.fill('textarea[placeholder*="company"]', 'Leading provider of tech vacancies in Vietnam.');
    await page.click('button:has-text("Save changes")');
    
    await expect(page.locator('text=Profile updated successfully').first()).toBeVisible();

    // Retrieve employer User ID
    employerUserId = execSync(`node ../job-backend/scratch/get_user_id.js ${employerEmail}`).toString().trim();
    console.log(`Employer registered with ID: ${employerUserId}`);

    // Approve employer profile via database helper to bypass admin approval for posting
    console.log(`Approving employer profile for ${employerEmail}...`);
    execSync(`node ../job-backend/scratch/approve_employer.js ${employerEmail}`);

    // Post a New Job
    await page.goto('/dashboard/jobs');
    await page.click('button:has-text("Đăng tin tuyển dụng")');
    
    await page.fill('input[placeholder*="Lập trình viên"]', jobTitle);
    await page.fill('input[placeholder*="Hà Nội"]', 'Da Nang, Viet Nam');
    await page.fill('textarea[placeholder*="nhiệm vụ"]', 'Looking for software engineers to write Playwright E2E browser tests.');
    await page.fill('input[placeholder*="React, Node.js"]', 'Node.js, React, TypeScript');
    await page.fill('input[placeholder*="kinh nghiệm"]', 'Có kinh nghiệm, Sử dụng Git');
    await page.fill('input[type="date"]', '2026-12-31');
    
    await page.click('button:has-text("Đăng tuyển")');
    
    // Verify job listing is present in employer list
    await page.waitForTimeout(2000);
    await expect(page.locator(`text=${jobTitle}`).first()).toBeVisible();
  });

  test('3. Admin Flow: Approve Job Post', async ({ page }) => {
    // Login as Admin
    await page.goto('/auth/login');
    await page.fill('#email', adminEmail);
    await page.fill('#password', password);
    await page.click('button[type="submit"]');
    
    await expect(page).toHaveURL(/.*dashboard/);

    // Navigate to Admin tab
    await page.goto('/dashboard/admin');
    
    // Verify Recharts/Analytics stats load
    await expect(page.locator('text=Tăng trưởng người dùng mới')).toBeVisible();

    // Go to "Tin tuyển dụng" Tab
    await page.click('button:has-text("Tin tuyển dụng")');
    
    // Verify the posted job is in the pending list
    const jobRow = page.locator(`tr:has-text("${jobTitle}")`);
    await expect(jobRow).toBeVisible();
    
    // Approve the Job Listing
    await jobRow.locator('button:has-text("Phê duyệt")').click();
    
    // Verify status changes to approved (Vietnamese displays "Đã duyệt")
    await expect(jobRow.locator('text=Đã duyệt')).toBeVisible();
  });

  test('4. Candidate Flow: Search Job & Submit Application', async ({ page }) => {
    // Login as Candidate
    await page.goto('/auth/login');
    await page.fill('#email', candidateEmail);
    await page.fill('#password', password);
    await page.click('button[type="submit"]');
    
    await expect(page).toHaveURL(/.*dashboard/);

    // Go to jobs board search page
    await page.goto('/dashboard/jobs');
    
    // Search for the approved E2E job (Vietnamese search placeholder)
    await page.fill('input[placeholder*="Tìm kiếm"]', jobTitle);
    await page.press('input[placeholder*="Tìm kiếm"]', 'Enter');
    
    // Verify job is visible (click on the job card title)
    const jobCard = page.locator(`div:has-text("${jobTitle}")`);
    await expect(jobCard.first()).toBeVisible();
    
    // Click card to open modal details
    await jobCard.first().click();
    
    // Click Apply button ("Ứng tuyển ngay" in Vietnamese modal)
    await page.click('button:has-text("Ứng tuyển ngay")');
    
    // Enter cover letter ("Giới thiệu bản thân" in Vietnamese input)
    await page.fill('textarea[placeholder*="Giới thiệu bản thân"]', 'Hello, this is my E2E test application cover letter.');
    await page.click('button:has-text("Xác nhận nộp đơn")');
    
    // Track Application status
    await page.goto('/dashboard/applications');
    await expect(page.locator(`text=${jobTitle}`).first()).toBeVisible();
    await expect(page.locator('text=Chờ duyệt').first()).toBeVisible();
  });

  test('5. Real-Time Chat WebSocket Flow (Multi-Window)', async ({ browser }) => {
    // Create candidate browser context
    const candidateContext = await browser.newContext();
    const candidatePage = await candidateContext.newPage();
    
    // Create employer browser context
    const employerContext = await browser.newContext();
    const employerPage = await employerContext.newPage();
    
    // 1. Candidate Logs In & goes to Chat Room targeting Employer
    await candidatePage.goto('/auth/login');
    await candidatePage.fill('#email', candidateEmail);
    await candidatePage.fill('#password', password);
    await candidatePage.click('button[type="submit"]');
    await expect(candidatePage).toHaveURL(/.*dashboard/);
    
    // Direct navigate to messages pointing to employerUserId
    await candidatePage.goto(`/dashboard/messages?userId=${employerUserId}`);
    await candidatePage.waitForTimeout(2000);

    // 2. Employer Logs In & goes to Messages
    await employerPage.goto('/auth/login');
    await employerPage.fill('#email', employerEmail);
    await employerPage.fill('#password', password);
    await employerPage.click('button[type="submit"]');
    await expect(employerPage).toHaveURL(/.*dashboard/);
    await employerPage.goto(`/dashboard/messages`);
    await employerPage.waitForTimeout(2000);

    // 3. Candidate Types and Sends Message
    const candidateMsg = `Hello Employer! This is a real-time message sent at ${Date.now()}`;
    await candidatePage.fill('input[placeholder*="Nhập nội dung"]', candidateMsg);
    
    // Verify that Employer sees the Candidate is typing (user_typing socket event)
    // Wait briefly for the typing event to bubble
    await candidatePage.waitForTimeout(500);
    await expect(employerPage.locator('text=Đang soạn tin nhắn')).toBeVisible();

    // Candidate clicks send
    await candidatePage.click('button:has(svg)');

    // 4. Verify Employer receives message instantly via websocket
    await expect(employerPage.locator(`text=${candidateMsg}`)).toBeVisible();

    // 5. Employer Replies back
    const employerReply = `Hello Candidate! Received your message. Let's schedule an interview.`;
    await employerPage.fill('input[placeholder*="Nhập nội dung"]', employerReply);
    await employerPage.click('button:has(svg)');

    // 6. Verify Candidate receives reply instantly and sees check double ticks
    await expect(candidatePage.locator(`text=${employerReply}`)).toBeVisible();

    // Cleanup Contexts
    await candidateContext.close();
    await employerContext.close();
  });
});
