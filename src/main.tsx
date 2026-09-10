import { useEffect, useMemo, useState } from "react";
import ReactDOM from "react-dom/client";
import { ModelAPI } from "./api/ModelAPI";
import { Auth, Logout } from "./auth/Auth";
import { OfflineCache } from "./offline/OfflineCache";

type Model = {
  id: string;
  display_name: string;
  family: string;
  architecture_category: string;
  weight_format: string;
  safetensor_file_count: string;
  hf_tags?: {
    pipeline_tag?: string;
  };
};

function useDebounce(value: string, delay = 400) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}

function App() {
    const [loggedIn, setLoggedIn] = useState(false);

if (!loggedIn) {
  return <Auth onLogin={() => setLoggedIn(true)} />;
}
  const [models, setModels] = useState<Model[]>([]);
  const [search, setSearch] = useState("");
  const [family, setFamily] = useState("");
  const [architecture, setArchitecture] = useState("");
  const [pipeline, setPipeline] = useState("");
  const [sort, setSort] = useState("name-asc");
  const [loading, setLoading] = useState(true);

  const [online, setOnline] = useState(navigator.onLine);

useEffect(() => {
  const goOnline = () => setOnline(true);
  const goOffline = () => setOnline(false);

  window.addEventListener("online", goOnline);
  window.addEventListener("offline", goOffline);

  return () => {
    window.removeEventListener("online", goOnline);
    window.removeEventListener("offline", goOffline);
  };
}, []);
  const debouncedSearch = useDebounce(search);

  useEffect(() => {
  const api = new ModelAPI();

  api
    .fetchModels()
    .then((data) => {
      setModels(data);
      OfflineCache.save(data);
    })
    .catch(() => {
      const cached = OfflineCache.load<Model[]>();

      if (cached) {
        setModels(cached);
      }
    })
    .finally(() => setLoading(false));
}, []);

  const families = useMemo(
    () => [...new Set(models.map((m) => m.family))].sort(),
    [models]
  );

  const architectures = useMemo(
    () => [...new Set(models.map((m) => m.architecture_category))].sort(),
    [models]
  );

  const pipelines = useMemo(
    () =>
      [...new Set(models.map((m) => m.hf_tags?.pipeline_tag).filter(Boolean))]
        .sort(),
    [models]
  );

  const filteredModels = useMemo(() => {
    const query = debouncedSearch.toLowerCase().trim();

    const result = models.filter((model) => {
      const matchesSearch =
        !query ||
        model.display_name.toLowerCase().includes(query) ||
        model.family.toLowerCase().includes(query);

      const matchesFamily = !family || model.family === family;

      const matchesArchitecture =
        !architecture ||
        model.architecture_category === architecture;

      const matchesPipeline =
        !pipeline || model.hf_tags?.pipeline_tag === pipeline;

      return (
        matchesSearch &&
        matchesFamily &&
        matchesArchitecture &&
        matchesPipeline
      );
    });

    return [...result].sort((a, b) => {
      if (sort === "name-desc")
        return b.display_name.localeCompare(a.display_name);

      if (sort === "files-desc")
        return (
          Number(b.safetensor_file_count) -
          Number(a.safetensor_file_count)
        );

      if (sort === "files-asc")
        return (
          Number(a.safetensor_file_count) -
          Number(b.safetensor_file_count)
        );

      return a.display_name.localeCompare(b.display_name);
    });
  }, [
    models,
    debouncedSearch,
    family,
    architecture,
    pipeline,
    sort,
  ]);

  if (loading) return <h1>Loading models...</h1>;

  return (
    <div style={{ padding: 30 }}>
      <h1>Binaire Model Selector</h1>

      <input
        placeholder="Search model or family..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{ padding: 10, width: 300 }}
      />

      <select value={family} onChange={(e) => setFamily(e.target.value)}>
        <option value="">All Families</option>
        {families.map((x) => (
          <option key={x}>{x}</option>
        ))}
      </select>

      <select
        value={architecture}
        onChange={(e) => setArchitecture(e.target.value)}
      >
        <option value="">All Architectures</option>
        {architectures.map((x) => (
          <option key={x}>{x}</option>
        ))}
      </select>

      <select
        value={pipeline}
        onChange={(e) => setPipeline(e.target.value)}
      >
        <option value="">All Pipelines</option>
        {pipelines.map((x) => (
          <option key={x}>{x}</option>
        ))}
      </select>

      <select value={sort} onChange={(e) => setSort(e.target.value)}>
        <option value="name-asc">Name A-Z</option>
        <option value="name-desc">Name Z-A</option>
        <option value="files-asc">Safetensors Low-High</option>
        <option value="files-desc">Safetensors High-Low</option>
      </select>

      <p>
        Showing <b>{filteredModels.length}</b> / {models.length} models
      </p>

      {filteredModels.map((model) => (
        <div
          key={model.id}
          style={{
            border: "1px solid #ddd",
            padding: 15,
            margin: "10px 0",
          }}
        >
          <h2>{model.display_name}</h2>
          <p>Family: {model.family}</p>
          <p>Architecture: {model.architecture_category}</p>
          <p>Pipeline: {model.hf_tags?.pipeline_tag || "N/A"}</p>
          <p>Weight: {model.weight_format}</p>
          <p>Safetensors: {model.safetensor_file_count}</p>
        </div>
      ))}
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")!).render(<App />);