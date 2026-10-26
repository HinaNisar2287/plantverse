
"use client";

import { useMemo, useState } from "react";

type Plant = {
  id: number;
  name: string;
  scientific: string;
  family: string;
  category: string;
  sunlight: string;
  water: string;
  description: string;
  image: string;
};

const plants: Plant[] = [
  {
    id: 1,
    name: "Monstera",
    scientific: "Monstera deliciosa",
    family: "Araceae",
    category: "Indoor",
    sunlight: "Bright, indirect light",
    water: "When the top soil dries",
    description:
      "A tropical climbing plant known for its large, split leaves. It grows best in warm conditions and well-draining soil.",
    image:
      "https://images.unsplash.com/photo-1614594975525-e45190c55d0b?auto=format&fit=crop&w=900&q=85",
  },
  {
    id: 2,
    name: "Sunflower",
    scientific: "Helianthus annuus",
    family: "Asteraceae",
    category: "Flowering",
    sunlight: "Full sun",
    water: "Regular, especially when young",
    description:
      "An annual flowering plant with a large flower head. It is grown for ornamental purposes and edible seeds.",
    image:
      "https://images.unsplash.com/photo-1470509037663-253afd7f0f51?auto=format&fit=crop&w=900&q=85",
  },
  {
    id: 3,
    name: "Aloe Vera",
    scientific: "Aloe vera",
    family: "Asphodelaceae",
    category: "Medicinal",
    sunlight: "Bright light",
    water: "Allow soil to dry between watering",
    description:
      "A succulent plant with fleshy leaves. It stores water in its leaves and prefers well-draining soil.",
    image:
      "https://images.unsplash.com/photo-1501004318641-b39e6451bec6?auto=format&fit=crop&w=900&q=85",
  },
  {
    id: 4,
    name: "Neem",
    scientific: "Azadirachta indica",
    family: "Meliaceae",
    category: "Trees",
    sunlight: "Full sun",
    water: "Water young trees regularly",
    description:
      "An evergreen tree native to the Indian subcontinent. It is important in traditional uses and environmental research.",
    image:
      "https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=900&q=85",
  },
  {
    id: 5,
    name: "Rose",
    scientific: "Rosa",
    family: "Rosaceae",
    category: "Flowering",
    sunlight: "Around 6 hours of sun",
    water: "Water soil deeply as needed",
    description:
      "A flowering plant grown in gardens for its colourful flowers and fragrance. There are many species and cultivars.",
    image:
      "https://images.unsplash.com/photo-1494972308805-463bc619d34e?auto=format&fit=crop&w=900&q=85",
  },
  {
    id: 6,
    name: "Snake Plant",
    scientific: "Dracaena trifasciata",
    family: "Asparagaceae",
    category: "Indoor",
    sunlight: "Indirect light or low light",
    water: "Let soil dry between watering",
    description:
      "A popular indoor plant with upright, sword-shaped leaves. It tolerates a range of indoor light conditions.",
    image:
      "https://images.unsplash.com/photo-1593482892290-f54927ae2b7b?auto=format&fit=crop&w=900&q=85",
  },
  {
    id: 7,
    name: "Jade Plant",
    scientific: "Crassula ovata",
    family: "Crassulaceae",
    category: "Succulents",
    sunlight: "Bright light",
    water: "Water when soil is dry",
    description:
      "A succulent shrub with thick leaves and fleshy stems. It needs a pot with drainage and careful watering.",
    image:
      "https://images.unsplash.com/photo-1509423350716-97f9360b4e09?auto=format&fit=crop&w=900&q=85",
  },
  {
    id: 8,
    name: "Peace Lily",
    scientific: "Spathiphyllum",
    family: "Araceae",
    category: "Indoor",
    sunlight: "Bright, indirect light",
    water: "Keep soil lightly moist",
    description:
      "A tropical plant with glossy leaves and distinctive pale flower-like spathes. Avoid direct harsh sunlight.",
    image:
      "https://images.unsplash.com/photo-1593691509543-c55fb32e5cee?auto=format&fit=crop&w=900&q=85",
  },
];

const categories = [
  "All",
  "Indoor",
  "Flowering",
  "Medicinal",
  "Trees",
  "Succulents",
];

export default function Home() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [selected, setSelected] = useState<Plant | null>(null);
  const [photo, setPhoto] = useState<File | null>(null);
  const [preview, setPreview] = useState("");
  const [aiResult, setAiResult] = useState("");
  const [loading, setLoading] = useState(false);

  const filteredPlants = useMemo(() => {
    const query = search.toLowerCase().trim();

    return plants.filter((plant) => {
      const matchesSearch =
        plant.name.toLowerCase().includes(query) ||
        plant.scientific.toLowerCase().includes(query) ||
        plant.family.toLowerCase().includes(query);

      const matchesCategory =
        category === "All" || plant.category === category;

      return matchesSearch && matchesCategory;
    });
  }, [search, category]);

  function choosePhoto(file?: File) {
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setAiResult("Please select an image file.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setAiResult("Please choose an image smaller than 5 MB.");
      return;
    }

    setPhoto(file);
    setPreview(URL.createObjectURL(file));
    setAiResult("");
  }

  async function identifyPlant() {
    if (!photo) {
      setAiResult("Please upload a plant photo first.");
      return;
    }

    setLoading(true);
    setAiResult("");

    try {
      const reader = new FileReader();

      const base64 = await new Promise<string>((resolve, reject) => {
        reader.onload = () => {
          const result = reader.result;
          if (typeof result === "string") {
            resolve(result.split(",")[1]);
          } else {
            reject(new Error("Could not read the image."));
          }
        };
        reader.onerror = () => reject(new Error("Could not read the image."));
        reader.readAsDataURL(photo);
      });

      const response = await fetch("/api/identify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          image: base64,
          mimeType: photo.type,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Identification failed.");
      }

      setAiResult(data.result);
    } catch (error) {
      setAiResult(
        error instanceof Error
          ? error.message
          : "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#faf9f4] text-[#203b2b]">
      <header className="sticky top-0 z-30 border-b border-[#e2e8dc] bg-[#faf9f4]/95 backdrop-blur">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4">
          <a href="#" className="text-2xl font-bold tracking-tight">
            🌿 PlantVerse
          </a>

          <div className="hidden gap-7 text-sm font-medium md:flex">
            <a href="#home" className="hover:text-green-700">Home</a>
            <a href="#explore" className="hover:text-green-700">Explore</a>
            <a href="#identify" className="hover:text-green-700">AI Identify</a>
            <a href="#about" className="hover:text-green-700">About</a>
          </div>

          <a
            href="#explore"
            className="rounded-full bg-[#24583d] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#173e2a]"
          >
            Explore plants
          </a>
        </nav>
      </header>

      <section
        id="home"
        className="mx-auto grid max-w-7xl items-center gap-10 px-5 py-16 md:grid-cols-2 md:py-24"
      >
        <div>
          <p className="mb-5 inline-block rounded-full bg-[#e8eee1] px-4 py-2 text-sm font-semibold text-[#416849]">
            YOUR DIGITAL BOTANICAL LIBRARY
          </p>

          <h1 className="max-w-xl text-5xl leading-tight font-bold tracking-tight md:text-7xl">
            Every plant has a <span className="text-[#648653]">story.</span>
          </h1>

          <p className="mt-6 max-w-lg text-lg leading-8 text-[#667467]">
            Explore the fascinating world of plants. Learn their scientific
            names, discover their families, and understand how they grow.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <a
              href="#explore"
              className="rounded-full bg-[#24583d] px-7 py-3.5 font-semibold text-white hover:bg-[#173e2a]"
            >
              Discover plants →
            </a>
            <a
              href="#identify"
              className="rounded-full border border-[#cbd8c7] px-7 py-3.5 font-semibold hover:bg-[#edf1e8]"
            >
              Identify a plant
            </a>
          </div>

          <div className="mt-10 flex gap-8 text-sm text-[#667467]">
            <p><strong className="block text-2xl text-[#24583d]">8+</strong>Plant profiles</p>
            <p><strong className="block text-2xl text-[#24583d]">6</strong>Plant categories</p>
            <p><strong className="block text-2xl text-[#24583d]">AI</strong>Photo assistant</p>
          </div>
        </div>

        <div className="relative">
          <img
            src="https://images.unsplash.com/photo-1485955900006-10f4d324d411?auto=format&fit=crop&w=1200&q=90"
            alt="A collection of green potted plants"
            className="h-[440px] w-full rounded-[2rem] object-cover shadow-xl md:h-[540px]"
          />
          <div className="absolute bottom-5 left-5 rounded-2xl bg-white/95 p-4 shadow-lg">
            <p className="text-sm text-[#667467]">Today's botanical reminder</p>
            <p className="mt-1 font-semibold">Observe. Learn. Grow. 🌱</p>
          </div>
        </div>
      </section>

      <section id="explore" className="bg-white px-5 py-16 md:py-20">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8 md:flex md:items-end md:justify-between">
            <div>
              <p className="font-semibold text-[#648653]">THE PLANT LIBRARY</p>
              <h2 className="mt-2 text-3xl font-bold md:text-4xl">
                Find your next discovery
              </h2>
              <p className="mt-3 text-[#667467]">
                Search plants by common name, scientific name, or family.
              </p>
            </div>

            <p className="mt-4 text-sm text-[#667467] md:mt-0">
              {filteredPlants.length} plants found
            </p>
          </div>

          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="🔍  Search Monstera, Aloe vera, Araceae..."
            aria-label="Search plants"
            className="mb-5 w-full rounded-2xl border border-[#dce4d7] bg-[#faf9f4] px-5 py-4 outline-none focus:border-[#648653] focus:ring-2 focus:ring-[#dce9d4]"
          />

          <div className="mb-9 flex flex-wrap gap-2">
            {categories.map((item) => (
              <button
                key={item}
                onClick={() => setCategory(item)}
                className={`rounded-full px-5 py-2.5 text-sm font-medium transition ${
                  category === item
                    ? "bg-[#24583d] text-white"
                    : "border border-[#dce4d7] bg-white hover:bg-[#edf1e8]"
                }`}
              >
                {item}
              </button>
            ))}
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {filteredPlants.map((plant) => (
              <article
                key={plant.id}
                className="group overflow-hidden rounded-3xl border border-[#e8ebe3] bg-[#faf9f4] transition hover:-translate-y-1 hover:shadow-xl"
              >
                <button
                  onClick={() => setSelected(plant)}
                  className="block w-full text-left"
                  aria-label={`View details for ${plant.name}`}
                >
                  <img
                    src={plant.image}
                    alt={plant.name}
                    className="h-56 w-full object-cover transition duration-500 group-hover:scale-[1.03]"
                  />
                  <div className="p-5">
                    <span className="rounded-full bg-[#e8eee1] px-3 py-1 text-xs font-semibold text-[#416849]">
                      {plant.category}
                    </span>
                    <h3 className="mt-4 text-xl font-bold">{plant.name}</h3>
                    <p className="mt-1 text-sm italic text-[#667467]">
                      {plant.scientific}
                    </p>
                    <p className="mt-4 text-sm font-semibold text-[#416849]">
                      Explore details →
                    </p>
                  </div>
                </button>
              </article>
            ))}
          </div>

          {filteredPlants.length === 0 && (
            <p className="rounded-2xl bg-[#faf9f4] p-8 text-center text-[#667467]">
              No plants found. Try another name or category.
            </p>
          )}
        </div>
      </section>

      <section id="identify" className="px-5 py-16 md:py-20">
        <div className="mx-auto grid max-w-7xl gap-10 rounded-[2rem] bg-[#eaf0e4] p-6 md:grid-cols-2 md:p-12">
          <div className="flex flex-col justify-center">
            <p className="font-semibold text-[#648653]">AI BOTANICAL ASSISTANT</p>
            <h2 className="mt-3 text-3xl font-bold md:text-4xl">
              What plant did you discover?
            </h2>
            <p className="mt-4 leading-7 text-[#667467]">
              Upload a clear plant photo to ask an AI assistant for a possible
              identification, scientific name, and useful botanical clues.
            </p>
            <p className="mt-4 text-sm text-[#667467]">
              AI results can be incorrect. Treat identification as a suggestion,
              not a confirmed scientific determination.
            </p>
          </div>

          <div className="rounded-3xl bg-white p-6 shadow-sm">
            <label
              htmlFor="plant-photo"
              className="flex min-h-48 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[#b9cbb3] bg-[#faf9f4] p-5 text-center hover:bg-[#f0f4ec]"
            >
              {preview ? (
                <img
                  src={preview}
                  alt="Selected plant"
                  className="max-h-64 rounded-xl object-contain"
                />
              ) : (
                <>
                  <span className="text-4xl">📷</span>
                  <span className="mt-3 font-semibold">Upload a plant photo</span>
                  <span className="mt-1 text-sm text-[#667467]">
                    JPG, PNG, or WebP · Maximum 5 MB
                  </span>
                </>
              )}
            </label>

            <input
              id="plant-photo"
              type="file"
              accept="image/*"
              className="sr-only"
              onChange={(event) => choosePhoto(event.target.files?.[0])}
            />

            <button
              onClick={identifyPlant}
              disabled={loading}
              className="mt-5 w-full rounded-full bg-[#24583d] px-6 py-3.5 font-semibold text-white hover:bg-[#173e2a] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Analyzing photo..." : "Identify my plant ✨"}
            </button>

            {aiResult && (
              <div
                aria-live="polite"
                className="mt-5 whitespace-pre-wrap rounded-2xl bg-[#f1f4ec] p-4 text-sm leading-7"
              >
                {aiResult}
              </div>
            )}
          </div>
        </div>
      </section>

      <section id="about" className="px-5 py-16 text-center">
        <p className="font-semibold text-[#648653]">GROW YOUR KNOWLEDGE</p>
        <h2 className="mt-3 text-3xl font-bold">Science meets nature.</h2>
        <p className="mx-auto mt-4 max-w-2xl leading-7 text-[#667467]">
          PlantVerse is a learning project designed to make botanical
          information easier to explore. Plant profiles are educational
          examples and can be expanded with verified scientific references.
        </p>
      </section>

      <footer className="bg-[#173e2a] px-5 py-8 text-center text-sm text-white/80">
        <p className="text-lg font-bold text-white">🌿 PlantVerse</p>
        <p className="mt-2">Explore plants. Understand nature. Keep growing.</p>
        <p className="mt-4">Built with Next.js and Tailwind CSS.</p>
      </footer>

      {selected && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/60 p-4"
          onClick={() => setSelected(null)}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="plant-title"
            className="my-auto max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-[#faf9f4] shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <img
              src={selected.image}
              alt={selected.name}
              className="h-64 w-full object-cover"
            />
            <div className="p-6 md:p-8">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-[#648653]">
                    {selected.category} PLANT
                  </p>
                  <h2 id="plant-title" className="mt-2 text-3xl font-bold">
                    {selected.name}
                  </h2>
                  <p className="mt-1 italic text-[#667467]">
                    {selected.scientific}
                  </p>
                </div>
                <button
                  onClick={() => setSelected(null)}
                  aria-label="Close plant details"
                  className="rounded-full border border-[#dce4d7] px-4 py-2 hover:bg-[#e8eee1]"
                >
                  ✕
                </button>
              </div>

              <p className="mt-6 leading-7">{selected.description}</p>

              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl bg-[#e8eee1] p-4">
                  <p className="text-sm text-[#667467]">Plant family</p>
                  <p className="mt-1 font-semibold">{selected.family}</p>
                </div>
                <div className="rounded-2xl bg-[#e8eee1] p-4">
                  <p className="text-sm text-[#667467]">Sunlight</p>
                  <p className="mt-1 font-semibold">{selected.sunlight}</p>
                </div>
                <div className="rounded-2xl bg-[#e8eee1] p-4 sm:col-span-2">
                  <p className="text-sm text-[#667467]">Watering guide</p>
                  <p className="mt-1 font-semibold">{selected.water}</p>
                </div>
              </div>

              <p className="mt-5 text-sm leading-6 text-[#667467]">
                Growing needs vary with climate, season, soil, and growing
                conditions. Check a reliable botanical source for species-specific
                advice.
              </p>
              <button
                onClick={() => setSelected(null)}
                className="mt-6 rounded-full bg-[#24583d] px-6 py-3 font-semibold text-white"
              >
                Back to plants
              </button>
            </div>
          </section>
        </div>
      )}
    </main>
  );
}

import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "AI is not configured yet. Add your Gemini API key." },
        { status: 503 }
      );
    }

    const body = await request.json();
    const image = body.image;
    const mimeType = body.mimeType;

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    if (
      typeof image !== "string" ||
      image.length === 0 ||
      image.length > 7_000_000 ||
      typeof mimeType !== "string" ||
      !allowedTypes.includes(mimeType)
    ) {
      return NextResponse.json(
        { error: "Please upload a valid JPG, PNG, or WebP image under 5 MB." },
        { status: 400 }
      );
    }

    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey,
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text:
                    "Act as a cautious botanical assistant. Examine this image. " +
                    "Give the likely plant identification, possible scientific name, " +
                    "visible identifying features, and confidence level. " +
                    "If the image does not show a plant clearly, say so. " +
                    "Do not claim certainty from an unclear image. " +
                    "Do not infer medicinal safety or edibility from identification. " +
                    "Keep the answer concise and educational.",
                },
                {
                  inline_data: {
                    mime_type: mimeType,
                    data: image,
                  },
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.2,
            maxOutputTokens: 500,
          },
        }),
        signal: AbortSignal.timeout(30000),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("Gemini API request failed:", response.status);

      return NextResponse.json(
        { error: "The AI service could not analyze the image. Please try again." },
        { status: 502 }
      );
    }

    const result = data.candidates?.[0]?.content?.parts
      ?.map((part: { text?: string }) => part.text ?? "")
      .join("\n")
      .trim();

    if (!result) {
      return NextResponse.json(
        { error: "No identification was returned. Try a clearer photo." },
        { status: 502 }
      );
    }

    return NextResponse.json({ result });
  } catch {
    return NextResponse.json(
      { error: "Unable to analyze the image right now. Please try again." },
      { status: 500 }
    );
  }
}
