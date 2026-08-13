"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Radio,
  Video,
  Users,
  Mic,
  MicOff,
  VideoOff,
  Square,
  Play,
  Loader2,
} from "lucide-react";

type Stream = {
  id: number;
  userId: number;
  title: string;
  isLive: boolean;
  viewers: number | null;
  createdAt: string | null;
};

type SignalState = {
  offer?: RTCSessionDescriptionInit;
  answer?: RTCSessionDescriptionInit;
  broadcasterCandidates?: RTCIceCandidateInit[];
  viewerCandidates?: RTCIceCandidateInit[];
};

export default function LivePage() {
  const router = useRouter();

  const [user, setUser] = useState<any>(null);
  const [streams, setStreams] = useState<Stream[]>([]);
  const [selectedStream, setSelectedStream] =
    useState<Stream | null>(null);

  const [isStreaming, setIsStreaming] = useState(false);
  const [isWatching, setIsWatching] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState("بث مباشر");

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);

  const localStreamRef =
    useRef<MediaStream | null>(null);

  const peerRef =
    useRef<RTCPeerConnection | null>(null);

  const processedBroadcasterCandidates =
    useRef(0);

  const processedViewerCandidates =
    useRef(0);

  const wait = (ms: number) =>
    new Promise<void>((resolve) =>
      setTimeout(resolve, ms)
    );

  const loadStreams = async () => {
    try {
      const response = await fetch("/api/live", {
        cache: "no-store",
      });

      const data = await response.json();

      if (data.success && Array.isArray(data.streams)) {
        setStreams(data.streams);
      }
    } catch (error) {
      console.error("فشل تحميل البثوث:", error);
    }
  };

  const signalQueueRef = useRef<Promise<void>>(Promise.resolve());

const sendSignal = async (
  streamId: number,
  type: string,
  data: unknown
) => {
  signalQueueRef.current =
    signalQueueRef.current.then(async () => {
      const response = await fetch("/api/live", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "signal",
          streamId,
          type,
          data,
        }),
      });

      if (!response.ok) {
        throw new Error("فشل إرسال بيانات WebRTC");
      }
    });

  return signalQueueRef.current;
};

  const getSignal = async (
    streamId: number
  ): Promise<SignalState> => {
    const response = await fetch(
      `/api/live?streamId=${streamId}`,
      {
        cache: "no-store",
      }
    );

    if (!response.ok) {
      throw new Error("فشل قراءة بيانات البث");
    }

    const data = await response.json();

    return data.signal || {};
  };

  const createPeer = () => {
    const peer = new RTCPeerConnection({
      iceServers: [
        {
          urls: "stun:stun.l.google.com:19302",
        },
        {
          urls: "stun:stun.cloudflare.com:3478",
        },
      ],
    });

    peerRef.current = peer;

    peer.onconnectionstatechange = () => {
      console.log(
        "WebRTC connection:",
        peer.connectionState
      );
    };

    peer.oniceconnectionstatechange = () => {
      console.log(
        "WebRTC ICE:",
        peer.iceConnectionState
      );
    };

    return peer;
  };

  useEffect(() => {
    const storedUser =
      localStorage.getItem("rabahdj_user");

    if (!storedUser) {
      router.push("/join");
      return;
    }

    try {
      setUser(JSON.parse(storedUser));
    } catch {
      localStorage.removeItem("rabahdj_user");
      router.push("/join");
      return;
    }

    loadStreams();

    const interval = setInterval(
      loadStreams,
      5000
    );

    return () => clearInterval(interval);
  }, [router]);

  const startStream = async () => {
    if (!user) return;

    setLoading(true);

    try {
      if (
        !navigator.mediaDevices ||
        !navigator.mediaDevices.getUserMedia
      ) {
        throw new Error(
          `تشخيص الكاميرا:
protocol=${location.protocol}
secure=${window.isSecureContext}
mediaDevices=${!!navigator.mediaDevices}
getUserMedia=${!!navigator.mediaDevices?.getUserMedia}`
        );
      }

      console.log("طلب الكاميرا والميكروفون...");

      const media =
        await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: "user",
          },
          audio: true,
        });

      console.log(
        "تم الحصول على الكاميرا والميكروفون"
      );

      localStreamRef.current = media;

      if (localVideoRef.current) {
        localVideoRef.current.srcObject = media;
      }

      const createResponse = await fetch(
        "/api/live",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            action: "start",
            userId: user.id,
            title,
          }),
        }
      );

      const createData =
        await createResponse.json();

      if (!createData.success) {
        throw new Error(
          createData.error ||
            "فشل إنشاء البث"
        );
      }

      const stream: Stream =
        createData.stream;

      console.log(
        "تم إنشاء البث:",
        stream.id
      );

      const peer = createPeer();

      processedViewerCandidates.current = 0;

      media.getTracks().forEach((track) => {
        peer.addTrack(track, media);
      });

      peer.onicecandidate = async (
        event: RTCPeerConnectionIceEvent
      ) => {
        if (!event.candidate) return;

        try {
          await sendSignal(
            stream.id,
            "broadcaster-candidate",
            event.candidate.toJSON()
          );
        } catch (error) {
          console.error(
            "فشل إرسال ICE للمذيع:",
            error
          );
        }
      };

      const offer =
        await peer.createOffer();

      await peer.setLocalDescription(
        offer
      );

      await sendSignal(
        stream.id,
        "offer",
        peer.localDescription
      );

      console.log(
        "تم إرسال Offer للمشاهدين"
      );

      setSelectedStream(stream);
      setIsStreaming(true);

      await loadStreams();

      // انتظار Answer من المشاهد
      for (let i = 0; i < 120; i++) {
        if (peerRef.current !== peer) {
          break;
        }

        const signal =
          await getSignal(stream.id);

        if (
          signal.answer &&
          !peer.currentRemoteDescription
        ) {
          console.log(
            "تم استلام Answer"
          );

          await peer.setRemoteDescription(
            new RTCSessionDescription(
              signal.answer
            )
          );
        }

        const candidates =
          signal.viewerCandidates || [];

        while (
          processedViewerCandidates.current <
          candidates.length
        ) {
          const candidate =
            candidates[
              processedViewerCandidates.current
            ];

          processedViewerCandidates.current++;

          try {
            await peer.addIceCandidate(
              new RTCIceCandidate(candidate)
            );
          } catch (error) {
            console.error(
              "خطأ في إضافة ICE للمذيع:",
              error
            );
          }
        }

        if (
          peer.connectionState ===
            "connected" ||
          peer.iceConnectionState ===
            "connected" ||
          peer.iceConnectionState ===
            "completed"
        ) {
          console.log(
            "تم اتصال المذيع بالمشاهد"
          );
          break;
        }

        if (
          peer.connectionState ===
            "failed" ||
          peer.connectionState ===
            "closed"
        ) {
          break;
        }

        await wait(1000);
      }
    } catch (error: any) {
      console.error(
        "خطأ بدء البث:",
        error
      );

      localStreamRef.current
        ?.getTracks()
        .forEach((track) => track.stop());

      localStreamRef.current = null;

      alert(
        error?.message ||
          "تعذر بدء البث"
      );
    } finally {
      setLoading(false);
    }
  };

  const watchStream = async (
    stream: Stream
  ) => {
    setLoading(true);

    try {
      console.log(
        "البحث عن Offer للبث:",
        stream.id
      );

      let signal: SignalState = {};

      // انتظر حتى يظهر Offer
      for (let i = 0; i < 30; i++) {
        signal = await getSignal(
          stream.id
        );

        if (signal.offer) {
          break;
        }

        await wait(1000);
      }

      if (!signal.offer) {
        throw new Error(
          "لم يتم تجهيز اتصال البث خلال 30 ثانية. تأكد أن المذيع بدأ البث وما زال متصلًا."
        );
      }

      console.log(
        "تم العثور على Offer"
      );

      const peer = createPeer();

      processedBroadcasterCandidates.current = 0;
      processedViewerCandidates.current = 0;

      peer.ontrack = (
        event: RTCTrackEvent
      ) => {
        console.log(
          "تم استقبال MediaStream"
        );

        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject =
            event.streams[0];

          remoteVideoRef.current
            .play()
            .catch((error) => {
              console.warn(
                "تعذر تشغيل الفيديو تلقائيًا:",
                error
              );
            });
        }
      };

      peer.onicecandidate = async (
        event: RTCPeerConnectionIceEvent
      ) => {
        if (!event.candidate) return;

        try {
          await sendSignal(
            stream.id,
            "viewer-candidate",
            event.candidate.toJSON()
          );
        } catch (error) {
          console.error(
            "فشل إرسال ICE للمشاهد:",
            error
          );
        }
      };

      await peer.setRemoteDescription(
        new RTCSessionDescription(
          signal.offer
        )
      );

      // أضف ICE الموجود مسبقًا
      const initialCandidates =
        signal.broadcasterCandidates || [];

      while (
        processedBroadcasterCandidates.current <
        initialCandidates.length
      ) {
        const candidate =
          initialCandidates[
            processedBroadcasterCandidates.current
          ];

        processedBroadcasterCandidates.current++;

        try {
          await peer.addIceCandidate(
            new RTCIceCandidate(candidate)
          );
        } catch (error) {
          console.error(
            "خطأ ICE أولي:",
            error
          );
        }
      }

      const answer =
        await peer.createAnswer();

      await peer.setLocalDescription(
        answer
      );

      await sendSignal(
        stream.id,
        "answer",
        peer.localDescription
      );

      console.log(
        "تم إرسال Answer للمذيع"
      );

      const viewerResponse =
        await fetch("/api/live", {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            action: "viewer",
            streamId: stream.id,
          }),
        });

      const viewerData =
        await viewerResponse.json();

      if (viewerData.success) {
        setStreams((current) =>
          current.map((item) =>
            item.id === stream.id
              ? {
                  ...item,
                  viewers:
                    viewerData.viewers,
                }
              : item
          )
        );
      }

      setSelectedStream(stream);
      setIsWatching(true);

      // متابعة ICE الجديد من المذيع
      for (let i = 0; i < 120; i++) {
        if (peerRef.current !== peer) {
          break;
        }

        const currentSignal =
          await getSignal(
            stream.id
          );

        const candidates =
          currentSignal.broadcasterCandidates ||
          [];

        while (
          processedBroadcasterCandidates.current <
          candidates.length
        ) {
          const candidate =
            candidates[
              processedBroadcasterCandidates.current
            ];

          processedBroadcasterCandidates.current++;

          try {
            await peer.addIceCandidate(
              new RTCIceCandidate(candidate)
            );
          } catch (error) {
            console.error(
              "خطأ ICE للمشاهد:",
              error
            );
          }
        }

        if (
          peer.connectionState ===
            "connected" ||
          peer.iceConnectionState ===
            "connected" ||
          peer.iceConnectionState ===
            "completed"
        ) {
          console.log(
            "تم اتصال المشاهد بالبث"
          );
          break;
        }

        if (
          peer.connectionState ===
            "failed" ||
          peer.connectionState ===
            "closed"
        ) {
          throw new Error(
            "فشل اتصال WebRTC بالبث."
          );
        }

        await wait(1000);
      }
    } catch (error: any) {
      console.error(
        "خطأ مشاهدة البث:",
        error
      );

      peerRef.current?.close();
      peerRef.current = null;

      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject =
          null;
      }

      setIsWatching(false);
      setSelectedStream(null);

      alert(
        error?.message ||
          "تعذر الاتصال بالبث"
      );
    } finally {
      setLoading(false);
    }
  };

  const stopStream = async () => {
    try {
      if (selectedStream) {
        await fetch("/api/live", {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            action: "stop",
            streamId:
              selectedStream.id,
          }),
        });
      }
    } catch (error) {
      console.error(
        "خطأ إيقاف البث:",
        error
      );
    }

    localStreamRef.current
      ?.getTracks()
      .forEach((track) => track.stop());

    localStreamRef.current = null;

    peerRef.current?.close();
    peerRef.current = null;

    if (localVideoRef.current) {
      localVideoRef.current.srcObject =
        null;
    }

    setIsStreaming(false);
    setSelectedStream(null);
    setIsMuted(false);
    setIsVideoOff(false);

    await loadStreams();
  };

  const stopWatching = () => {
    peerRef.current?.close();
    peerRef.current = null;

    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject =
        null;
    }

    setIsWatching(false);
    setSelectedStream(null);
  };

  const toggleMute = () => {
    const tracks =
      localStreamRef.current
        ?.getAudioTracks() || [];

    tracks.forEach((track) => {
      track.enabled = !track.enabled;
    });

    setIsMuted((value) => !value);
  };

  const toggleVideo = () => {
    const tracks =
      localStreamRef.current
        ?.getVideoTracks() || [];

    tracks.forEach((track) => {
      track.enabled = !track.enabled;
    });

    setIsVideoOff((value) => !value);
  };

  return (
    <div
      className="min-h-screen pb-20 bg-slate-950 text-white"
      dir="rtl"
    >
      <header className="sticky top-0 z-50 glass border-b border-slate-700/50">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-4">
          <button
            onClick={() => {
              if (isStreaming) {
                stopStream();
              }

              if (isWatching) {
                stopWatching();
              }

              router.push("/home");
            }}
            className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white"
          >
            <ArrowRight className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-purple-800 flex items-center justify-center">
              <Radio className="w-5 h-5" />
            </div>

            <div>
              <h1 className="text-xl font-bold">
                بث مباشر
              </h1>

              <div className="flex items-center gap-1">
                <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />

                <span className="text-xs text-slate-400">
                  {streams.length} بث نشط
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6">
        {!isStreaming &&
          !isWatching && (
            <>
              <div className="glass rounded-2xl p-5 mb-6">
                <label className="block text-sm text-slate-400 mb-2">
                  عنوان البث
                </label>

                <input
                  value={title}
                  onChange={(event) =>
                    setTitle(
                      event.target.value
                    )
                  }
                  className="w-full bg-slate-800 rounded-xl px-4 py-3 text-white outline-none border border-slate-700 focus:border-purple-500"
                  placeholder="اكتب عنوان البث"
                />

                <button
                  onClick={startStream}
                  disabled={loading}
                  className="w-full mt-4 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 rounded-xl py-4 font-bold flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Video className="w-5 h-5" />
                  )}

                  {loading
                    ? "جاري تجهيز البث..."
                    : "ابدأ بثًا حقيقيًا"}
                </button>
              </div>

              <h2 className="font-bold text-lg mb-4">
                البثوث النشطة
              </h2>

              {streams.length === 0 ? (
                <div className="glass rounded-2xl p-8 text-center">
                  <Radio className="w-12 h-12 mx-auto mb-3 text-slate-600" />

                  <p className="text-slate-400">
                    لا توجد بثوث مباشرة الآن
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {streams.map(
                    (stream) => (
                      <div
                        key={stream.id}
                        className="glass rounded-2xl p-4"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-20 h-20 rounded-xl bg-slate-800 flex items-center justify-center">
                            <Radio className="w-8 h-8 text-purple-400" />
                          </div>

                          <div className="flex-1">
                            <h3 className="font-bold">
                              {stream.title}
                            </h3>

                            <div className="flex items-center gap-2 text-sm text-slate-400 mt-2">
                              <span className="text-red-400">
                                ● مباشر
                              </span>

                              <span>•</span>

                              <Users className="w-4 h-4" />

                              <span>
                                {stream.viewers ||
                                  0}{" "}
                                مشاهد
                              </span>
                            </div>
                          </div>

                          <button
                            onClick={() =>
                              watchStream(
                                stream
                              )
                            }
                            disabled={loading}
                            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 rounded-full font-medium flex items-center gap-2"
                          >
                            <Play className="w-4 h-4 fill-current" />
                            مشاهدة
                          </button>
                        </div>
                      </div>
                    )
                  )}
                </div>
              )}
            </>
          )}

        {isStreaming &&
          selectedStream && (
            <div className="glass rounded-2xl p-4">
              <div className="relative bg-black rounded-xl overflow-hidden aspect-video">
                <video
                  ref={localVideoRef}
                  autoPlay
                  muted
                  playsInline
                  className="w-full h-full object-cover"
                />

                <div className="absolute top-3 right-3 bg-red-600 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-2">
                  <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
                  مباشر
                </div>
              </div>

              <h2 className="font-bold text-lg mt-4">
                {selectedStream.title}
              </h2>

              <p className="text-slate-400 text-sm mt-1">
                بث حقيقي من الكاميرا والميكروفون
              </p>

              <div className="flex items-center justify-center gap-3 mt-5">
                <button
                  onClick={toggleMute}
                  className={`w-12 h-12 rounded-full flex items-center justify-center ${
                    isMuted
                      ? "bg-red-600"
                      : "bg-slate-700"
                  }`}
                >
                  {isMuted ? (
                    <MicOff className="w-5 h-5" />
                  ) : (
                    <Mic className="w-5 h-5" />
                  )}
                </button>

                <button
                  onClick={toggleVideo}
                  className={`w-12 h-12 rounded-full flex items-center justify-center ${
                    isVideoOff
                      ? "bg-red-600"
                      : "bg-slate-700"
                  }`}
                >
                  {isVideoOff ? (
                    <VideoOff className="w-5 h-5" />
                  ) : (
                    <Video className="w-5 h-5" />
                  )}
                </button>

                <button
                  onClick={stopStream}
                  className="px-6 py-3 bg-red-600 hover:bg-red-700 rounded-full font-bold flex items-center gap-2"
                >
                  <Square className="w-4 h-4 fill-current" />
                  إيقاف البث
                </button>
              </div>
            </div>
          )}

        {isWatching &&
          selectedStream && (
            <div className="glass rounded-2xl p-4">
              <div className="relative bg-black rounded-xl overflow-hidden aspect-video">
                <video
                  ref={remoteVideoRef}
                  autoPlay
                  playsInline
                  controls
                  className="w-full h-full object-contain"
                />

                <div className="absolute top-3 right-3 bg-red-600 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-2">
                  <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
                  مباشر
                </div>
              </div>

              <h2 className="font-bold text-lg mt-4">
                {selectedStream.title}
              </h2>

              <p className="text-slate-400 text-sm mt-1">
                مشاهدة البث المباشر
              </p>

              <button
                onClick={stopWatching}
                className="w-full mt-5 px-6 py-3 bg-slate-700 hover:bg-slate-600 rounded-xl font-bold"
              >
                العودة إلى البثوث
              </button>
            </div>
          )}
      </main>
    </div>
  );
}
