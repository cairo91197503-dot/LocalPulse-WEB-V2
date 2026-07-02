import { useState, useEffect, useRef } from "react";
import { Bell, Star, Trophy, Sparkles, ExternalLink, X } from "lucide-react";
import { Link } from "react-router";
import { auth, db, messaging } from "../lib/firebase";
import { getToken, onMessage } from "firebase/messaging";
import { doc, setDoc } from "firebase/firestore";
import toast from "react-hot-toast";
import { useGmbData } from "../hooks/useGmbData";

export function NotificationBell() {
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const user = auth.currentUser;
  const { businessData } = useGmbData();
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const setupMessaging = async () => {
      if (messaging && user) {
        try {
          const permission = await Notification.requestPermission();
          if (permission === "granted") {
            const tokenOptions: any = {};
            if ((import.meta as any).env.VITE_VAPID_KEY) {
              tokenOptions.vapidKey = (import.meta as any).env.VITE_VAPID_KEY;
            }
            const token = await getToken(messaging, tokenOptions);
            if (token) {
              await setDoc(
                doc(db, "users", user.uid),
                { fcmToken: token },
                { merge: true },
              );
            }
          }
        } catch (error) {
          console.error("Error setting up Firebase Messaging:", error);
        }

        onMessage(messaging, (payload) => {
          setNotifications((prev) => [
            {
              id: Date.now(),
              type: "push",
              title: payload.notification?.title || "Nova Notificação",
              message: payload.notification?.body || "",
              read: false,
              link: payload.data?.link || "https://business.google.com/reviews",
            },
            ...prev,
          ]);
        });
      }
    };
    setupMessaging();
  }, [user]);

  useEffect(() => {
    if (businessData && businessData.reviews && businessData.reviews.length > 0) {
      const latestReview = businessData.reviews[0];
      setNotifications([
        {
          id: latestReview.reviewId || 1,
          type: "review",
          title: "Nova avaliação recebida!",
          message: `Você recebeu uma avaliação de ${latestReview.reviewer?.displayName || "Cliente"}. Responda para melhorar seu engajamento.`,
          read: false,
          link: "https://business.google.com/reviews",
        },
      ]);
    } else {
      setNotifications([]);
    }
  }, [businessData]);

  const prevReviewsLengthRef = useRef<number>(0);

  useEffect(() => {
    if (businessData && businessData.reviews && user) {
      const currentLength = businessData.reviews.length;
      const prevLength = prevReviewsLengthRef.current;

      if (prevLength > 0 && currentLength > prevLength) {
        const newReviewsCount = currentLength - prevLength;
        const latestReview = businessData.reviews[0];
        const payload = {
          notification: {
            title: "Nova Avaliação Recebida! ⭐",
            body: latestReview
              ? `${latestReview.reviewer.displayName} deixou uma avaliação de ${latestReview.starRating} estrelas.`
              : `Você recebeu ${newReviewsCount} nova(s) avaliação(ões).`,
          },
          data: { link: "https://business.google.com/reviews" },
        };

        if ("Notification" in window && Notification.permission === "granted") {
          new Notification(payload.notification.title, {
            body: payload.notification.body,
            icon: "/vite.svg",
            data: payload.data,
          });
        }

        setNotifications((prev) => [
          {
            id: Date.now() + Math.floor(Math.random() * 1000),
            type: "review",
            title: payload.notification.title,
            message: payload.notification.body,
            read: false,
            link: payload.data.link,
          },
          ...prev,
        ]);
        toast.success(payload.notification.title, { icon: "⭐" });
      }
      prevReviewsLengthRef.current = currentLength;
    }
  }, [businessData, user]);

  useEffect(() => {
    const checkMilestones = async () => {
      if (businessData && businessData.totalReviews && user) {
        const TARGET_REVIEWS = 100;
        if (businessData.totalReviews >= TARGET_REVIEWS) {
          const milestoneKey = `fcm_milestone_${TARGET_REVIEWS}_reviews_${businessData.name || "default"}`;
          const hasReachedMilestone = localStorage.getItem(milestoneKey);
          if (!hasReachedMilestone) {
            localStorage.setItem(milestoneKey, "true");
            const payload = {
              notification: {
                title: "Meta Atingida! 🎉",
                body: `Parabéns! Sua empresa alcançou a marca incrível de ${TARGET_REVIEWS} avaliações.`,
              },
              data: { link: "https://business.google.com/reviews" },
            };
            if ("Notification" in window && Notification.permission === "granted") {
              new Notification(payload.notification.title, {
                body: payload.notification.body,
                icon: "/vite.svg",
                data: payload.data,
              });
            }
            setNotifications((prev) => [
              {
                id: Date.now() + Math.floor(Math.random() * 1000),
                type: "milestone",
                title: payload.notification.title,
                message: payload.notification.body,
                read: false,
                link: payload.data.link,
              },
              ...prev,
            ]);
            toast.success(`Incrível! Você bateu a meta de ${TARGET_REVIEWS} avaliações! 🏆`, { duration: 5000, icon: "🚀" });
          }
        }
      }
    };
    checkMilestones();
  }, [businessData, user]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAsRead = (id: number) => {
    setNotifications(notifications.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        className="p-2 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:bg-slate-800 rounded-full flex items-center justify-center relative transition-colors"
        onClick={() => setShowNotifications(!showNotifications)}
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white dark:border-slate-900"></span>
        )}
      </button>

      {showNotifications && (
        <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-gray-100 dark:border-slate-800 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="p-4 border-b border-gray-100 dark:border-slate-800 flex items-center justify-between bg-gray-50 dark:bg-slate-950">
            <div>
              <h3 className="font-bold text-gray-900 dark:text-white">Notificações</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                {unreadCount} não lidas
              </p>
            </div>
            <button
              onClick={() => setShowNotifications(false)}
              className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-full hover:bg-gray-200 dark:hover:bg-slate-800 transition-colors"
            >
              <X size={16} />
            </button>
          </div>
          <div className="max-h-80 overflow-y-auto">
            {notifications.length > 0 ? (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 border-b border-gray-50 hover:bg-gray-50 dark:hover:bg-slate-800/50 dark:bg-slate-950 transition-colors relative ${notification.read ? "opacity-60" : ""}`}
                >
                  {!notification.read && <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500"></div>}
                  <div className="flex gap-3">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                        notification.type === "review"
                          ? "bg-yellow-100 text-yellow-600"
                          : notification.type === "milestone"
                            ? "bg-green-100 text-green-600"
                            : "bg-purple-100 text-purple-600"
                      }`}
                    >
                      {notification.type === "review" ? (
                        <Star size={18} className="fill-yellow-500" />
                      ) : notification.type === "milestone" ? (
                        <Trophy size={18} className="text-green-500" />
                      ) : (
                        <Sparkles size={18} />
                      )}
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-gray-900 dark:text-white">{notification.title}</h4>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-2">{notification.message}</p>
                      <div className="flex items-center gap-3 mt-2">
                        {notification.type === "review" ? (
                          <a
                            href={notification.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
                            onClick={() => markAsRead(notification.id)}
                          >
                            Ver Avaliação <ExternalLink size={12} />
                          </a>
                        ) : notification.type === "milestone" ? (
                          <a
                            href={notification.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
                            onClick={() => markAsRead(notification.id)}
                          >
                            Comemorar <ExternalLink size={12} />
                          </a>
                        ) : (
                          <Link
                            to={notification.link}
                            className="text-xs font-bold text-blue-600 hover:text-blue-700"
                            onClick={() => markAsRead(notification.id)}
                          >
                            Ver Dica
                          </Link>
                        )}
                        {!notification.read && (
                          <button
                            onClick={() => markAsRead(notification.id)}
                            className="text-xs text-gray-400 hover:text-gray-600 dark:text-gray-400 font-medium"
                          >
                            Marcar como lida
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                <Bell size={24} className="mx-auto mb-2 opacity-20" />
                <p className="text-sm">Nenhuma notificação nova</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
