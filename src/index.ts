import express from "express";
import dotenv from "dotenv";
import axios from "axios";
import cors from "cors";
import { fetchPosts, getProfilePicture } from "./utils";
import { AuthorModel, connectToDB, PostModel } from "./db";
import { checkExistURN } from "./middleware";
dotenv.config();

const app = express();

app.use(express.json());

const CORSOptions = {
  origin: ['http://localhost:3000'],
  credentials: true
}

app.use(cors(CORSOptions));
connectToDB();


app.get("/", (req, res) => {
  res.send("It's Working. 😊")
})

app.post("/api/v1/username", checkExistURN, async (req, res) => {

  try {
    const profileURN = req.body.profileURN;
    const sessionCookie = req.body.sessionCookie;
    const userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36 Edg/131.0.0.0';

    if (!profileURN || !sessionCookie) {
      res.status(400).json({ error: 'Profile URN and cookies are required' });
    }
    console.log(profileURN, sessionCookie)
    console.log("GOT TO POST FUNCTION");
    const posts = await fetchPosts(profileURN, userAgent, sessionCookie);
    if (!req.body.isExist) {
      const profilePic = await getProfilePicture(profileURN, userAgent, req.body.sessionCookie);
      AuthorModel.findOneAndUpdate({ profileURN: profileURN }, { profilePicUrl: profilePic });
    }
    console.log("BACK THEN")

    await Promise.all(posts.map(async (e) => {
      await PostModel.create({
        url: e.postLink,
        profileURN: profileURN,
        content: e.postContent
      })
      console.log(e);
    }))
    // .then((data) => {
    //   console.log(data);
    // }).catch((err) => {
    //   res.send({ message: "Getting Error while inserting in DB", error: err });
    // })
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

app.get("/api/v1/posts", async (req, res) => {
  try {

    const profileURN = req.query.profileURN;
    if (!profileURN) {
      res.status(400).send({ message: "Sorry but we're unable serve the data without profileURN :(" })
    }

    const posts = await PostModel.find({ profileURN: profileURN })

    if (posts) {
      res.send({ message: "All Posts Fetched Successfully", data: posts });
    }

    else {
      res.send({ message: `Sorry We do not have any data for this profileURN: ${profileURN}` });
    }
  }
  catch (err) {
    res.status(500).send({ message: "Internal Server Error", error: err });
  }
})

app.get("/api/v1/username", async (req, res) => {
  try {
    const userData = await AuthorModel.find();
    if (userData) {
      res.send({ message: "User Data Retrieved Successfully", data: userData });
    }
    else {
      res.send({ message: "Sorry We're unable to serve the request at this time. Please, try after some time :(" });
    }
  } catch (err) {
    res.status(500).send({ message: "Internal Server Error", error: err })
  }
})


app.listen(9000, () => {
  console.log(`Server listening on http://localhost:9000`)
})



// https://www.npmjs.com/package/puppeteer

// https://rapidapi.com/rockapis-rockapis-default/api/linkedin-data-api/playground/apiendpoint_632238af-cef0-4897-b877-86957df4ca71

// https://phantombuster.com/automations/linkedin/5251160215300729/linkedin-post-commenter-and-liker-scraper