'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/components/ai-elements/auth";
import { db } from "@/lib/firebase";
import { doc, onSnapshot } from "firebase/firestore";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import Link from "next/link";

const ProfilePage = () => {
  const { user } = useAuth();
  interface UserInfo {
  username?: string;
  about?: string;
}

  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);

  useEffect(() => {
    if (user) {
      const userDocRef = doc(db, `users/${user.uid}`);
      const unsubscribe = onSnapshot(userDocRef, (doc) => {
        if (doc.exists()) {
          setUserInfo(doc.data());
        }
      });

      return () => unsubscribe();
    }
  }, [user]);

  return (
    <div className="flex justify-center items-center h-full">
      <Card className="card w-full max-w-lg gap-3">
        <CardHeader className="card-header px-0">
          <CardTitle className="card-title">{userInfo?.username || 'User'}</CardTitle>
          <p className="text-secondary-foreground text-0">{user?.email}</p>
          <Link href="/profile/edit">
            <Button variant="outline" className="btn-outline">Edit Profile</Button>
          </Link>
        </CardHeader>
        <CardContent className="card-content">
          <Separator />
            <h3 className="card-title">About</h3>
            <p className="text-secondary-foreground text-0">
              {userInfo?.about || "No information provided."}
            </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfilePage;