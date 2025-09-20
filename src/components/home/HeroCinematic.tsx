import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";

const TEAL = "#004D40";

export default function HeroCinematic() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [loaded, setLoaded] = useState(false);
  const [playing, setPlaying] = useState(true);
  const [progress, setProgress] = useState(0); // 0..1

  // pause bila tab tidak aktif / section tidak terlihat (hemat baterai)
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;

    let raf = 0;
    const tick = () => {
      if (v?.duration && !Number.isNaN(v.duration)) {
        setProgress(v.currentTime / v.duration);
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    const onPlaying = () => setLoaded(true);
    const onLoaded = () => setLoaded(true);
    v.addEventListener("playing", onPlaying);
    v.addEventListener("loadeddata", onLoaded);

    // IntersectionObserver untuk auto-pause saat discroll pergi
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!videoRef.current) return;
        if (entry.isIntersecting) {
          if (playing) videoRef.current.play().catch(() => {});
        } else {
          videoRef.current.pause();
        }
      },
      { threshold: 0.25 }
    );
    io.observe(v);

    // Prefers-reduced-motion → jangan autoplay
    const m = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (m.matches) {
      v.pause();
      setPlaying(false);
    }

    return () => {
      cancelAnimationFrame(raf);
      v.removeEventListener("playing", onPlaying);
      v.removeEventListener("loadeddata", onLoaded);
      io.disconnect();
    };
  }, [playing]);

  const sceneIndex = Math.floor((progress * 3) % 3); // 3 indikator ala "scenes"
  const scenePart = (progress * 3) % 1;

  const togglePlay = () => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) {
      v.play().then(() => setPlaying(true)).catch(() => {});
    } else {
      v.pause();
      setPlaying(false);
    }
  };

  const bars = useMemo(() => {
    return [0, 1, 2].map((i) => {
      let w = 0;
      if (i < sceneIndex) w = 100;
      else if (i === sceneIndex) w = Math.max(2, Math.min(100, Math.round(scenePart * 100)));
      return w;
    });
  }, [sceneIndex, scenePart]);

  return (
    <section className="relative h-[100dvh] min-h-[560px] w-full overflow-hidden">
      {/* Video background */}
      <video
        ref={videoRef}
        className="absolute inset-0 h-full w-full object-cover"
        src="/videos/umkm-hero.mp4"
        // pastikan video kamu H.264 + aac/atau tanpa audio. poster opsional:
        poster="/images/hero-poster.jpg"
        autoPlay
        muted
        playsInline
        loop
        preload="metadata"
      />

      {/* Overlay gelap halus untuk kontras */}
      <div className="absolute inset-0 bg-black/30" />

      {/* Box konten tengah (teal) */}
      <div className="relative z-[1] h-full w-full grid place-items-center px-4">
        <div
          className="max-w-2xl w-full text-white"
          style={{
            backgroundColor: TEAL + "CC", // teal + opacity
            borderRadius: 16,
            border: "1px solid rgba(255,255,255,0.12)",
            backdropFilter: "saturate(120%) blur(2px)",
          }}
        >
          <div className="p-6 md:p-10">
            <h1 className="text-3xl md:text-5xl font-extrabold lowercase leading-tight">
              kualitas dalam setiap sentuhan tangan
            </h1>
            <p className="mt-3 md:mt-4 text-sm md:text-base text-white/90">
              Kami menghubungkan Anda dengan karya terbaik dari para kreator lokal di seluruh
              nusantara.
            </p>

            <div className="mt-6">
              <Link
                href="/produk/produk"
                className="inline-flex items-center gap-2 font-semibold underline-offset-4 hover:underline"
                aria-label="Jelajahi produk"
              >
                <span>→ jelajahi produk</span>
              </Link>
            </div>

            {/* Kontrol kecil + indikator */}
            <div className="mt-6 flex items-center justify-between">
              <button
                onClick={togglePlay}
                aria-label={playing ? "Jeda video" : "Putar video"}
                className="grid h-9 w-9 place-items-center rounded-full border border-white/30 bg-white/10 hover:bg-white/20 transition"
                title={playing ? "Jeda" : "Putar"}
              >
                {/* Ikon play/pause minimal */}
                {playing ? (
                  <div className="flex gap-1">
                    <span className="block h-4 w-0.5 bg-white"></span>
                    <span className="block h-4 w-0.5 bg-white"></span>
                  </div>
                ) : (
                  <div
                    className="ml-0.5"
                    style={{
                      width: 0,
                      height: 0,
                      borderLeft: "8px solid white",
                      borderTop: "6px solid transparent",
                      borderBottom: "6px solid transparent",
                    }}
                  />
                )}
              </button>

              <div className="flex items-center gap-2 w-32">
                {bars.map((w, i) => (
                  <div key={i} className="relative h-1 flex-1 bg-white/20 overflow-hidden">
                    <div
                      className="absolute left-0 top-0 h-full bg-white"
                      style={{ width: `${w}%` }}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Fade-in halus saat video siap */}
          <div
            className={`transition-opacity duration-700 ${loaded ? "opacity-0" : "opacity-100"}`}
            style={{ height: 1 }}
            aria-hidden
          />
        </div>
      </div>
    </section>
  );
}
