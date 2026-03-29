import express from "express";
import { userAuth } from "../middlewares/auth.js";
import { supabase } from "../config/supabase.js";

const feedRouter = express.Router();

feedRouter.get("/feed", userAuth, async (req, res) => {
  try {
    const loggedInUserUid = req.user.uid;
    const page = parseInt(req.query.page) || 1;
    let limit = parseInt(req.query.limit) || 10;
    limit = limit > 50 ? 50 : limit;
    const skip = (page - 1) * limit;

    // In a real tinder-like feed with Supabase, you would filter out already connected users using another table.
    // Since connections aren't explicitly requested in the DB schema provided by the prompt, 
    // we will fetch all user profiles except the current user's.
    
    // Fetch profiles joined with users, skills, experience, education
    const { data: profiles, error } = await supabase
      .from('profiles')
      .select(`
        *,
        users (full_name, email),
        skills (skill_name),
        experience (role, company, duration, description),
        education (degree, graduation_year, college_name, grade)
      `)
      .neq('user_id', loggedInUserUid)
      .range(skip, skip + limit - 1);

    if (error) throw error;

    // Send mock data if database empty for UI demonstration
    if (!profiles || profiles.length === 0) {
      return res.json({
        data: [
          {
            user_id: "mock_1",
            users: { full_name: "Alex Jenkins" },
            about: "Obsessed with animations and React. Let's build something beautiful together. I specialize in highly interactive WebGL experiences.",
            profile_photo: "https://i.pravatar.cc/150?u=a042581f4e29026704d",
            github_url: "https://github.com/alexj",
            skills: [{skill_name: "React"}, {skill_name: "Three.js"}, {skill_name: "Framer Motion"}]
          },
          {
            user_id: "mock_2",
            users: { full_name: "Sarah Chen" },
            about: "Building highly scalable microservices. Currently exploring serverless architectures and distributed systems.",
            profile_photo: "https://i.pravatar.cc/150?u=a042581f4e29026024d",
            github_url: "https://github.com/sarah",
            skills: [{skill_name: "Go"}, {skill_name: "Kubernetes"}, {skill_name: "Docker"}]
          }
        ]
      });
    }

    res.json({ data: profiles });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

export { feedRouter };
