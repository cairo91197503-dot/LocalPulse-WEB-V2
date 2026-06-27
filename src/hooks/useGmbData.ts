import { useState, useEffect } from "react";
import { auth, db } from "../lib/firebase";
import { doc, onSnapshot } from "firebase/firestore";

export function useGmbData() {
  const user = auth.currentUser;
  const [gmbConnected, setGmbConnected] = useState(false);
  const [businessData, setBusinessData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  useEffect(() => {
    if (!user) {
      setGmbConnected(false);
      setBusinessData(null);
      setLoading(false);
      setLastUpdated(null);
      return;
    }

    const docRef = doc(db, "users", user.uid);
    
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      setLoading(true);
      if (docSnap.exists() && docSnap.data().gmbConnected) {
        setGmbConnected(true);
        setBusinessData(docSnap.data().businessData || null);
        setLastUpdated(new Date());
      } else {
        setGmbConnected(false);
        setBusinessData(null);
        setLastUpdated(new Date());
      }
      setLoading(false);
    }, (error) => {
      console.error("Error fetching GMB data:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  return { gmbConnected, businessData, loading, lastUpdated };
}
