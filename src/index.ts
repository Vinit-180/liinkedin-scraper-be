import express, { Request, Response } from "express";
import dotenv from "dotenv";
import bcrypt from "bcrypt";
import cors from "cors";
import { comparePassword, fetchPosts, getProfilePicture } from "./utils/utils";
import { AuthorModel, connectToDB, PostModel, UserModel } from "./db";
import { checkExistURN, isValidUser } from "./middleware";
import jwt from "jsonwebtoken";
dotenv.config();

const app = express();
app.use(express.json());

const CORSOptions = {
  origin: ['http://localhost:3000','https://linkedin-scraper-weld.vercel.app'],
  credentials: true,
  methods: ['POST','GET']

}

app.use(cors(CORSOptions));
connectToDB();


app.get("/", (req, res) => {
  res.send("It's Working. 😊")
})

app.post("/api/v1/username", isValidUser, checkExistURN, async (req, res) => {

  try {
    const profileURN = req.body.profileURN;
    const sessionCookie = req.body.sessionCookie;
    const userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36 Edg/131.0.0.0';

    if (!profileURN || !sessionCookie) {
      res.status(400).json({ error: 'Profile URN and cookies are required' });
      return ;
    }
    console.log(profileURN, sessionCookie)
    console.log("GOT TO POST FUNCTION");
    const posts = await fetchPosts(profileURN, userAgent, sessionCookie);
    if (req.body.isExist && req.body.existedUser[0].profilePicUrl === undefined) {
      const profilePic = await getProfilePicture(profileURN, userAgent, req.body.sessionCookie);
      await AuthorModel.findOneAndUpdate({ profileURN: profileURN }, { profilePicUrl: profilePic });
    }
    console.log("BACK THEN")
    var newAdded = 0;
    if (Array.isArray(posts)) {
      await Promise.all(posts.map(async (e) => {
        const existingPost = await PostModel.find({ url: e.postLink, profileURN: profileURN });
        if (existingPost.length === 0) {
          newAdded += 1;
          await PostModel.create({
            url: e.postLink,
            profileURN: profileURN,
            content: e.postContent
          })
        }
        console.log(e);
      }))

      res.send({ message: "Scraping Successfully", data: posts, newAdded: newAdded });
      return ;
    }
    else {
      console.log(posts); // Handle the error case
      res.status(500).send({ message: "Error fetching posts", error: posts.err });
      return ;
    }

  }
  catch (err) {
    res.send({ message: "Getting Error while inserting in DB", error: err });
    return;
  }

})

app.get("/api/v1/username", isValidUser, async (req, res) => {
  try {
    const userData = await AuthorModel.find();
    if (userData) {
      res.send({ message: "User Data Retrieved Successfully", data: userData });
      return ;
    }
    else {
      res.send({ message: "Sorry We're unable to serve the request at this time. Please, try after some time :(" });
    }
  } catch (err) {
    res.status(500).send({ message: "Internal Server Error", error: err })
  }
})
app.get("/api/v1/posts", async (req, res) => {
  try {

    const profileURN = req.query.profileURN;
    if (!profileURN) {
      res.status(400).send({ message: "Sorry but we're unable serve the data without profileURN :(" })
      return ;
    }

    const posts = await PostModel.find({ profileURN: profileURN })

    if (posts) {
      res.send({ message: "All Posts Fetched Successfully", data: posts });
      return ;
    }

    else {
      res.send({ message: `Sorry We do not have any data for this profileURN: ${profileURN}` });
    }
  }
  catch (err) {
    res.status(500).send({ message: "Internal Server Error", error: err });
  }
})



app.post("/api/v1/user/signup", async (req, res) => {
  try {
    const JWT_SECRET_KEY = process.env.JWT_SECRET_ACCESS_KEY!;
    const email = req.body.email;
    const isExist = await UserModel.find({ email: email });
      if (isExist.length !== 0) {
          res.status(400).send({ message: "User Already Exist with this email Id" })
          return;
      }
    
    const saltRounds = 10;
    req.body.password = await bcrypt.hash(req.body.password, saltRounds);
    const token = jwt.sign(
          {
            name:req.body.name,
            email: req.body.email,
          }, JWT_SECRET_KEY,
          { expiresIn: "30d" },
        )
    
    req.body.jwtToken = token;
    const data = await UserModel.create(req.body);
    const { password, isVerified, ...user } = data!.toObject();
    
    res.status(200).send({ message: "User Created Successfully", data: user });
    return;
  } catch (err) {
    res.status(500).send({ message: "Internal Server Error", error: err })
  }
})

app.post("/api/v1/user/signin", async (req, res) => {
  try {
    const JWT_SECRET_KEY = process.env.JWT_SECRET_ACCESS_KEY!;
    const email = req.body.email;
    const isExist = await UserModel.find({ email: email }).exec();
    if (isExist.length === 0 || isExist === null) {
      res.status(400).json({ message: "Incorrect email or password" });
      return;
    }
    const isCorrectPassword = await comparePassword(req.body.password, isExist[0].password!);
    if (!isCorrectPassword) {
      res.status(400).json({ message: "Incorrect email or password" });
      return;
    }
    const token = jwt.sign(
      {
        name:isExist[0].name,
        email: req.body.email,
      }, JWT_SECRET_KEY,
      { expiresIn: "30d" },
    )
    req.body.jwtToken = token;
    const data = await UserModel.findOneAndUpdate({ email: email }, { jwtToken: token });
    const { password, isVerified, ...user } = data!.toObject();
    res.status(200).json({ message: "User Signed In Successfully", data: user });
    return;
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Internal Server Error", error: err })
    return;
  }
})

app.listen(9000, () => {
  console.log(`Server listening on http://localhost:9000`)
})



// https://www.npmjs.com/package/puppeteer

// https://rapidapi.com/rockapis-rockapis-default/api/linkedin-data-api/playground/apiendpoint_632238af-cef0-4897-b877-86957df4ca71

// https://phantombuster.com/automations/linkedin/5251160215300729/linkedin-post-commenter-and-liker-scraper


// const authorPosts=await axios.get(`https://linkedin-data-api.p.rapidapi.com/get-profile-comments?username=${username}`, {
//     method: "GET",
//     headers: {
//       "x-rapidapi-host": "linkedin-data-api.p.rapidapi.com",
//       "x-rapidapi-key": api_key,
//     },
//   })
