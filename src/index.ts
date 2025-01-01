import express from "express";
import dotenv from "dotenv";
import axios from "axios";
import { fetchPosts } from "./utils";
import { connectToDB, PostModel } from "./db";
dotenv.config();
const app = express();
app.use(express.json());
connectToDB();
app.get("/", (req, res) => {
  res.send("It's Working. 😊")
})

app.post("/api/v1/username", async (req, res) => {
  const profileURN = req.body.profileURN;
  const sessionCookie = req.body.sessionCookie;
  const userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36 Edg/131.0.0.0';

  if (!profileURN || !sessionCookie) {
    res.status(400).json({ error: 'Profile URN and cookies are required' });
  }

  try {
    console.log(profileURN, sessionCookie)
    console.log("GOT TO POST FUNCTION");
    const posts = await fetchPosts(profileURN, userAgent, sessionCookie);
    console.log("BACK THEN")

    posts.map(async (e) => {
      await PostModel.create({
        url:e.postLink,
        profileURN:profileURN,
        content:e.postContent
      }).then((data) => {
        console.log(data);
      }).catch((err) => {
        res.send({ message: "Getting Error while inserting in DB", error: err });
      })
    })
    res.send({ message: "Scraping Successfully", data: posts });
  }
  catch (err) {
    res.send({ message: "Getting Error while inserting in DB", error: err });
  }
  // const authorPosts=await axios.get(`https://linkedin-data-api.p.rapidapi.com/get-profile-comments?username=${username}`, {
  //     method: "GET",
  //     headers: {
  //       "x-rapidapi-host": "linkedin-data-api.p.rapidapi.com",
  //       "x-rapidapi-key": api_key,
  //     },
  //   })

})

app.listen(9000, () => {
  console.log(`Server listening on http://localhost:9000`)
})



// https://www.npmjs.com/package/puppeteer

// https://rapidapi.com/rockapis-rockapis-default/api/linkedin-data-api/playground/apiendpoint_632238af-cef0-4897-b877-86957df4ca71

// https://phantombuster.com/automations/linkedin/5251160215300729/linkedin-post-commenter-and-liker-scraper