'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/components/ai-elements/auth";
import { db } from "@/lib/firebase";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { useEffect, useState } from "react";

interface UserProfileFormData {
  username?: string;
  email?: string;
  about?: string;
}

const EditProfilePage = () => {
  const { user } = useAuth();
  const [userInfo, setUserInfo] = useState<UserProfileFormData>({ username: '', about: '' });

  useEffect(() => {
    if (user) {
      const userDocRef = doc(db, `users/${user.uid}`);
      getDoc(userDocRef).then((docSnap) => {
        if (docSnap.exists()) {
          setUserInfo(docSnap.data() as UserProfileFormData);
        }
      });
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setUserInfo({ ...userInfo, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (user) {
      const userDocRef = doc(db, `users/${user.uid}`);
      await setDoc(userDocRef, {
        ...userInfo,
        email: user.email,
        creationTime: user.metadata.creationTime,
      }, { merge: true });
      alert("Profile updated successfully!");
    }
  };

  return (
    <div className="flex justify-center items-center h-full">
      <Card className="card w-full max-w-lg">
        <CardHeader className="card-header px-0 items-center">
          <CardTitle className="card-title">Edit Profile</CardTitle>
        </CardHeader>
        <CardContent className="card-content">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="gap-2 flex flex-col">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                name="username"
                value={userInfo.username}
                onChange={handleChange}
              />
            </div>
            <div className="gap-2 flex flex-col">
              <Label htmlFor="about">About</Label>
              <Textarea
                id="about"
                name="about"
                value={userInfo.about}
                onChange={handleChange}
              />
            </div>
            <Button type="submit" className="btn-primary w-full">Save</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default EditProfilePage;