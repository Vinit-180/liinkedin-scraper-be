import puppeteer from 'puppeteer';

export const fetchPosts = async (profileURN: string,userAgent:string, Cookies: string) => {
  const browser = await puppeteer.launch({headless:true});
  const page = await browser.newPage();
  // await browser.setCookie({ name: 'li_at', cookies: cookies, domain: '.linkedin.com' });
  // browser.setCookie({ name: 'li_at', cookies: Cookies, domain: '.linkedin.com' });

  await page.setUserAgent(userAgent);
  await page.setCookie({ name: 'li_at', value: Cookies, domain: '.linkedin.com' });
  // await page.Cook({ name: 'li_at', value: cookies, domain: '.linkedin.com' });
  // Navigate to profile activity page
  console.log(profileURN,Cookies,'------------')
  const activityURL = `${profileURN}/recent-activity/comments/`;

  console.log("START")
  await page.goto(activityURL, { timeout:60000 });
  console.log("INSIDE POST CONTENT");
  const posts = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('[data-urn^="urn:li:activity"]')).map(post => {
        // Extract the URN
        const urn = post.getAttribute('data-urn');
        const postId = urn ? urn.split(':').pop() : null;

        // Extract post content
        const contentElement = post.querySelector('[class*="update-v2__description"]'); 
        const postContent = contentElement ? contentElement.textContent?.trim() : null;
        // const postContent = contentElement ? contentElement.innerText.trim() : null;
        console.log("____________________________",urn);
        // Construct the post URL
        const postLink = postId ? `https://www.linkedin.com/feed/update/urn:li:activity:${postId}/` : null;

        return {
            postLink,
            // profileURN,
            postContent,
        };
    });
});

console.log("PPPPPPPPPPPPPPPPPP",posts)
console.log("Scraped Posts:", posts);
//   const posts = await page.evaluate(() => {
//     return Array.from(document.querySelectorAll('[data-urn^="urn:li:activity"]')).map(post => {
//       const urn = post.getAttribute('data-urn');
//       const content = post.querySelector('[class*="update-v2__description"]')?.textContent?.trim();
//       return { urn, content };
//     });
//   });

  await browser.close();

  return posts;
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