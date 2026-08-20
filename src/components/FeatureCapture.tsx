"use client";

import { useMemo, useState } from "react";

type Impact = 0.25 | 0.5 | 1 | 2 | 3;
type Confidence = 0.5 | 0.8 | 1;

type Feature = {
  id: string;
  title: string;
  description: string;
  category: string;
  status: "idea";
  reach: number;
  impact: Impact;
  confidence: Confidence;
  effort: number;
};

const IMPACT_OPTIONS: { value: Impact; label: string }[] = [
  { value: 0.25, label: "Mínimo (0.25)" },
  { value: 0.5, label: "Bajo (0.5)" },
  { value: 1, label: "Medio (1)" },
  { value: 2, label: "Alto (2)" },
  { value: 3, label: "Masivo (3)" },
];

const CONFIDENCE_OPTIONS: { value: Confidence; label: string }[] = [
  { value: 0.5, label: "Baja (50%)" },
  { value: 0.8, label: "Media (80%)" },
  { value: 1, label: "Alta (100%)" },
];

type FormState = {
  title: string;
  description: string;
  category: string;
  reach: string;
  impact: Impact;
  confidence: Confidence;
  effort: string;
};

const EMPTY_FORM: FormState = {
  title: "",
  description: "",
  category: "",
  reach: "",
  impact: 1,
  confidence: 0.8,
  effort: "",
};

type FormErrors = Partial<Record<keyof FormState, string>>;

function calculateRice(reach: number, impact: number, confidence: number, effort: number) {
  return (reach * impact * confidence) / effort;
}

function validate(form: FormState): FormErrors {
  const errors: FormErrors = {};

  if (!form.title.trim()) {
    errors.title = "El título es obligatorio.";
  }

  if (!form.description.trim()) {
    errors.description = "La descripción es obligatoria.";
  }

  if (!form.category.trim()) {
    errors.category = "La categoría es obligatoria.";
  }

  const reachNumber = Number(form.reach);
  if (!form.reach.trim()) {
    errors.reach = "El alcance es obligatorio.";
  } else if (!Number.isFinite(reachNumber) || reachNumber <= 0) {
    errors.reach = "El alcance debe ser un número mayor a 0.";
  }

  const effortNumber = Number(form.effort);
  if (!form.effort.trim()) {
    errors.effort = "El esfuerzo es obligatorio.";
  } else if (!Number.isFinite(effortNumber) || effortNumber <= 0) {
    errors.effort = "El esfuerzo debe ser un número mayor a 0.";
  }

  return errors;
}

export default function FeatureCapture() {
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [errors, setErrors] = useState<FormErrors>({});
  const [features, setFeatures] = useState<Feature[]>([]);

  const reachNumber = Number(form.reach);
  const effortNumber = Number(form.effort);
  const liveScore = useMemo(() => {
    if (!Number.isFinite(reachNumber) || reachNumber <= 0) return null;
    if (!Number.isFinite(effortNumber) || effortNumber <= 0) return null;
    return calculateRice(reachNumber, form.impact, form.confidence, effortNumber);
  }, [reachNumber, effortNumber, form.impact, form.confidence]);

  function handleChange<K extends keyof FormState>(field: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    const validationErrors = validate(form);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    const newFeature: Feature = {
      id: crypto.randomUUID(),
      title: form.title.trim(),
      description: form.description.trim(),
      category: form.category.trim(),
      status: "idea",
      reach: Number(form.reach),
      impact: form.impact,
      confidence: form.confidence,
      effort: Number(form.effort),
    };

    setFeatures((prev) => [newFeature, ...prev]);
    setForm(EMPTY_FORM);
    setErrors({});
  }

  return (
    <div className="mx-auto flex w-full max-w-xl flex-col gap-10 px-4 py-12">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">
          Capturar feature
        </h1>
        <p className="mt-2 text-zinc-600 dark:text-zinc-400">
          Cargá una idea con sus datos de priorización RICE.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        noValidate
        className="flex flex-col gap-5 rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
      >
        <Field label="Título" error={errors.title} htmlFor="title">
          <input
            id="title"
            type="text"
            value={form.title}
            onChange={(e) => handleChange("title", e.target.value)}
            placeholder="Ej: Checkout con un solo clic"
            className={inputClass(!!errors.title)}
          />
        </Field>

        <Field label="Descripción" error={errors.description} htmlFor="description">
          <textarea
            id="description"
            value={form.description}
            onChange={(e) => handleChange("description", e.target.value)}
            placeholder="¿Qué problema resuelve esta feature?"
            rows={3}
            className={inputClass(!!errors.description)}
          />
        </Field>

        <Field label="Categoría" error={errors.category} htmlFor="category">
          <input
            id="category"
            type="text"
            value={form.category}
            onChange={(e) => handleChange("category", e.target.value)}
            placeholder="Ej: onboarding, checkout"
            className={inputClass(!!errors.category)}
          />
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Reach (personas/trimestre)" error={errors.reach} htmlFor="reach">
            <input
              id="reach"
              type="number"
              min={0}
              value={form.reach}
              onChange={(e) => handleChange("reach", e.target.value)}
              placeholder="Ej: 2000"
              className={inputClass(!!errors.reach)}
            />
          </Field>

          <Field label="Effort (persona-meses)" error={errors.effort} htmlFor="effort">
            <input
              id="effort"
              type="number"
              min={0}
              step="0.5"
              value={form.effort}
              onChange={(e) => handleChange("effort", e.target.value)}
              placeholder="Ej: 1.5"
              className={inputClass(!!errors.effort)}
            />
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Impact" htmlFor="impact">
            <select
              id="impact"
              value={form.impact}
              onChange={(e) => handleChange("impact", Number(e.target.value) as Impact)}
              className={inputClass(false)}
            >
              {IMPACT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Confidence" htmlFor="confidence">
            <select
              id="confidence"
              value={form.confidence}
              onChange={(e) =>
                handleChange("confidence", Number(e.target.value) as Confidence)
              }
              className={inputClass(false)}
            >
              {CONFIDENCE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </Field>
        </div>

        <div className="flex items-center justify-between rounded-lg bg-zinc-50 px-4 py-3 dark:bg-zinc-800/50">
          <span className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
            Score RICE
          </span>
          <span className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
            {liveScore !== null ? liveScore.toFixed(1) : "—"}
          </span>
        </div>

        <button
          type="submit"
          className="mt-2 rounded-lg bg-zinc-900 px-4 py-2.5 font-medium text-white transition hover:bg-zinc-700 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          Agregar feature
        </button>
      </form>

      <div className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
          Features capturadas
        </h2>

        {features.length === 0 ? (
          <p className="rounded-lg border border-dashed border-zinc-300 px-4 py-8 text-center text-sm text-zinc-500 dark:border-zinc-700 dark:text-zinc-400">
            Todavía no cargaste ninguna feature.
          </p>
        ) : (
          <ul className="flex flex-col gap-3">
            {features.map((feature) => {
              const impactLabel = IMPACT_OPTIONS.find(
                (option) => option.value === feature.impact,
              )?.label;
              const confidenceLabel = CONFIDENCE_OPTIONS.find(
                (option) => option.value === feature.confidence,
              )?.label;

              return (
                <li
                  key={feature.id}
                  className="flex flex-col gap-3 rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-medium text-zinc-900 dark:text-zinc-50">
                        {feature.title}
                      </p>
                      <p className="text-sm text-zinc-500 dark:text-zinc-400">
                        {feature.category} · {feature.status}
                      </p>
                    </div>
                    <span className="shrink-0 rounded-full bg-zinc-100 px-3 py-1 text-sm font-semibold text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200">
                      {calculateRice(
                        feature.reach,
                        feature.impact,
                        feature.confidence,
                        feature.effort,
                      ).toFixed(1)}
                    </span>
                  </div>

                  <p className="text-sm text-zinc-600 dark:text-zinc-400">
                    {feature.description}
                  </p>

                  <dl className="grid grid-cols-2 gap-x-4 gap-y-1 border-t border-zinc-100 pt-3 text-sm dark:border-zinc-800 sm:grid-cols-4">
                    <div>
                      <dt className="text-zinc-500 dark:text-zinc-400">Reach</dt>
                      <dd className="font-medium text-zinc-900 dark:text-zinc-50">
                        {feature.reach}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-zinc-500 dark:text-zinc-400">Impact</dt>
                      <dd className="font-medium text-zinc-900 dark:text-zinc-50">
                        {impactLabel}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-zinc-500 dark:text-zinc-400">Confidence</dt>
                      <dd className="font-medium text-zinc-900 dark:text-zinc-50">
                        {confidenceLabel}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-zinc-500 dark:text-zinc-400">Effort</dt>
                      <dd className="font-medium text-zinc-900 dark:text-zinc-50">
                        {feature.effort}
                      </dd>
                    </div>
                  </dl>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}

function inputClass(hasError: boolean) {
  return [
    "w-full rounded-lg border bg-white px-3 py-2 text-zinc-900 outline-none transition",
    "dark:bg-zinc-950 dark:text-zinc-50",
    "focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100",
    hasError
      ? "border-red-500"
      : "border-zinc-300 dark:border-zinc-700",
  ].join(" ");
}

function Field({
  label,
  htmlFor,
  error,
  children,
}: {
  label: string;
  htmlFor: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={htmlFor} className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
        {label}
      </label>
      {children}
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}
