import mongoose, { model, Schema } from "mongoose";

async function ConnectToDB(){
    
    await mongoose.connect(process.env.DATABASE_URL!).then((data)=>{
        console.log("Connected to DB")
    }).catch((err)=>{
        console.log(err);
    })
}

// ConnectToDB();
export const connectToDB=ConnectToDB;

const AuthorSchema=new Schema({
    profileURN:{type:String,require:true},
    lastSynced:{type:Date,default:Date.now}
})

export const AuthorModel=model("author",AuthorSchema);


const PostSchema=new Schema({
    url:{type:String,require:true},
    profileURN:{type:String,require:true},
    content:{type:String,require:true},
    fetchedAt:{type:Date,default:Date.now}
})

export const PostModel=model("post",PostSchema)


