import puppeteer from 'puppeteer';

export const fetchPosts = async (profileURN: string, userAgent: string, Cookies: string) => {
  var posts = [];
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  try {

    // await browser.setCookie({ name: 'li_at', cookies: cookies, domain: '.linkedin.com' });
    // browser.setCookie({ name: 'li_at', cookies: Cookies, domain: '.linkedin.com' });

    await page.setUserAgent(userAgent);
    await page.setCookie({ name: 'li_at', value: Cookies, domain: '.linkedin.com' });

    console.log(profileURN, Cookies, '------------')
    const activityURL = `${profileURN}/recent-activity/comments/`;

    console.log("START")
    await page.goto(activityURL, { timeout: 60000 });
    console.log("INSIDE POST CONTENT");
    posts = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('[data-urn^="urn:li:activity"]')).map(post => {
        // Extract the URN
        const urn = post.getAttribute('data-urn');
        const postId = urn ? urn.split(':').pop() : null;

        // Extract post content
        const contentElement = post.querySelector('[class*="update-v2__description"]');
        const postContent = contentElement ? contentElement.textContent?.trim() : null;
        // const postContent = contentElement ? contentElement.innerText.trim() : null;

        // Construct the post URL
        const postLink = postId ? `https://www.linkedin.com/feed/update/urn:li:activity:${postId}/` : null;

        return {
          postLink,
          // profileURN,
          postContent,
        };
      });
    });

    console.log("Scraped Posts:", posts);
    return posts;
  }
  catch (err) {
    console.log(err);
    return {err:err };
  }
  finally{
    await browser.close();
  }
  
};
/**
 * // Example: Check last sync time before scraping new data
const lastSync = profile.lastSynced;
const now = new Date();

if (!lastSync || now - lastSync > 24 * 60 * 60 * 1000) {
  // If no sync or it's older than 24 hours, scrape new data
  await scrapePosts(profileURN, cookies);
}

 */



export const getProfilePicture = async (profileURN: string, userAgent: string, sessionCookie: string) => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.setUserAgent(userAgent);
  await page.setCookie({ name: 'li_at', value: sessionCookie, domain: '.linkedin.com', });

  console.log(`Navigating to: ${profileURN}`);

  await page.goto(profileURN, { waitUntil: 'domcontentloaded', timeout: 30000 });

  try {

    await page.waitForSelector('img', { timeout: 30000 });
    // const profilePicUrl = await page.waitForSelector('img[class*="profile-picture__image--show"]', { timeout: 10000 })
    const profilePicUrl = await page.evaluate(() => {
      const profilePicElement = document.querySelector('img[class*="profile-picture__image--show"]'); 
      return profilePicElement ? profilePicElement.getAttribute('src') : null;
    });

    console.log(`Profile Picture URL: ${profilePicUrl}`);
    // await browser.close();
    return profilePicUrl;
  } catch (error) {
    console.error('Failed to find profile picture:', error);
    // await browser.close();
    return null;
  }
  finally {
    await browser.close();
}
};
