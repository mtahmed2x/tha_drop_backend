import { AboutSchema } from "@schemas/aboutSchema";
import { model, Schema } from "mongoose";

const aboutSchema = new Schema<AboutSchema>({
    text: {
        type: String,
        required: true,
    }
})

const About = model("About", aboutSchema);
export default About;