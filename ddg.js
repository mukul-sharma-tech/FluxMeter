import fetch from "node-fetch";
import * as cheerio from "cheerio";

async function fetchUnsplashImages(topic) {
  const url = `https://unsplash.com/s/photos/${encodeURIComponent(topic)}`;
  const response = await fetch(url);
  const html = await response.text();

  const $ = cheerio.load(html);

  const links = [];
  $("img[srcset]").each((_, el) => {
    const src = $(el).attr("src");
    if (src && !links.includes(src)) {
      links.push(src);
    }
  });

  return links;
}

fetchUnsplashImages("mountains").then(urls => {
  console.log("Scraped Unsplash image URLs:");
  console.log(urls.slice(0, 5));
});
