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
    profileURN:{type:String,require:true,unique:true},
    profilePicUrl:{type:String},
    lastSynced:{type:Date,default:Date.now}
})

export const AuthorModel=model("author",AuthorSchema);


const PostSchema=new Schema({
    url:{type:String,require:true},
    profileURN:{type:String,require:true,ref:'author'},
    content:{type:String,require:true},
    fetchedAt:{type:Date,default:Date.now}
})

export const PostModel=model("post",PostSchema)




const UserSchema=new Schema({
    name:{type:String,require:true},
    email:{type:String,require:true,unique:true},
    password:{type:String,require:true},
    sessionCookies:{type:String},
    linkedinUrl:{type:String},
    jwtToken:{type:String},
    isVerified:{type:Boolean,default:false}
})

export const UserModel=model("user",UserSchema);