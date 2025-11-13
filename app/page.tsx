'use client';

import React from 'react';
import { z } from 'zod';
import { FeatureSchema } from '../lib/schema';

type Features = z.infer<typeof FeatureSchema>;

type PredictionResponse = {
  probability: number;
  riskCategory: 'Low' | 'Intermediate' | 'High';
  contributions: Record<string, number>;
};

const defaultValues: Features = {
  ageYears: 60,
  male: true,
  chestPainTypical: true,
  stElevationMm: 2,
  reciprocalChanges: true,
  troponinNgL: 80,
  heartRateBpm: 90,
  systolicBp: 120,
  smoker: false,
  diabetes: false,
};

export default function HomePage() {
  const [form, setForm] = React.useState<Features>(defaultValues);
  const [result, setResult] = React.useState<PredictionResponse | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const setField = <K extends keyof Features>(key: K, value: Features[K]) => {
    setForm((f) => ({ ...f, [key]: value }));
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    setResult(null);
    try {
      const parsed = FeatureSchema.safeParse(form);
      if (!parsed.success) {
        throw new Error(parsed.error.issues.map((i) => i.message).join('\n'));
      }
      const res = await fetch('/api/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(parsed.data),
      });
      if (!res.ok) throw new Error('Prediction failed');
      const json = (await res.json()) as PredictionResponse;
      setResult(json);
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setForm(defaultValues);
    setResult(null);
    setError(null);
  };

  const topContribs = React.useMemo(() => {
    if (!result) return [] as Array<[string, number]>;
    const entries = Object.entries(result.contributions).filter(([k]) => k !== 'intercept');
    return entries
      .sort((a, b) => Math.abs(b[1]) - Math.abs(a[1]))
      .slice(0, 5);
  }, [result]);

  return (
    <div className="grid two">
      <section>
        <form onSubmit={onSubmit} className="card">
          <h2>Patient Features</h2>
          <div className="fields">
            <label>
              <span>Age (years)</span>
              <input
                type="number"
                min={18}
                max={100}
                value={form.ageYears}
                onChange={(e) => setField('ageYears', Number(e.target.value))}
              />
            </label>
            <label className="row">
              <input
                type="checkbox"
                checked={form.male}
                onChange={(e) => setField('male', e.target.checked)}
              />
              <span>Male</span>
            </label>
            <label className="row">
              <input
                type="checkbox"
                checked={form.chestPainTypical}
                onChange={(e) => setField('chestPainTypical', e.target.checked)}
              />
              <span>Typical ischemic chest pain</span>
            </label>
            <label>
              <span>ST elevation (mm, max lead)</span>
              <input
                type="number"
                step={0.5}
                min={0}
                max={10}
                value={form.stElevationMm}
                onChange={(e) => setField('stElevationMm', Number(e.target.value))}
              />
            </label>
            <label className="row">
              <input
                type="checkbox"
                checked={form.reciprocalChanges}
                onChange={(e) => setField('reciprocalChanges', e.target.checked)}
              />
              <span>Reciprocal ST changes present</span>
            </label>
            <label>
              <span>Troponin (ng/L)</span>
              <input
                type="number"
                step={1}
                min={0}
                max={100000}
                value={form.troponinNgL}
                onChange={(e) => setField('troponinNgL', Number(e.target.value))}
              />
            </label>
            <label>
              <span>Heart rate (bpm)</span>
              <input
                type="number"
                min={30}
                max={220}
                value={form.heartRateBpm}
                onChange={(e) => setField('heartRateBpm', Number(e.target.value))}
              />
            </label>
            <label>
              <span>Systolic BP (mmHg)</span>
              <input
                type="number"
                min={60}
                max={240}
                value={form.systolicBp}
                onChange={(e) => setField('systolicBp', Number(e.target.value))}
              />
            </label>
            <label className="row">
              <input
                type="checkbox"
                checked={form.smoker}
                onChange={(e) => setField('smoker', e.target.checked)}
              />
              <span>Current smoker</span>
            </label>
            <label className="row">
              <input
                type="checkbox"
                checked={form.diabetes}
                onChange={(e) => setField('diabetes', e.target.checked)}
              />
              <span>Diabetes</span>
            </label>
          </div>
          <div className="actions">
            <button type="submit" disabled={loading}>
              {loading ? 'Predicting?' : 'Predict STEMI Probability'}
            </button>
            <button type="button" className="secondary" onClick={reset} disabled={loading}>
              Reset
            </button>
          </div>
          {error && <p className="error">{error}</p>}
        </form>
      </section>

      <section>
        <div className="card">
          <h2>Result</h2>
          {!result ? (
            <p className="muted">Submit features to see prediction.</p>
          ) : (
            <div>
              <div className={`badge ${result.riskCategory.toLowerCase()}`}>
                {result.riskCategory}
              </div>
              <p className="prob">
                Probability of STEMI: <strong>{(result.probability * 100).toFixed(1)}%</strong>
              </p>
              <h3>Top contributing features</h3>
              <ul className="contribs">
                {topContribs.map(([k, v]) => (
                  <li key={k}>
                    <span className="name">{k}</span>
                    <span className={`value ${v >= 0 ? 'pos' : 'neg'}`}>
                      {v >= 0 ? '+' : ''}{v.toFixed(2)}
                    </span>
                  </li>
                ))}
              </ul>
              <p className="muted small">
                Contributions are log-odds units relative to the model's intercept.
              </p>
            </div>
          )}
        </div>

        <div className="card warning">
          <strong>Disclaimer:</strong> This is an educational demo only and must not be used for diagnosis or treatment. Always consult qualified clinicians and follow local protocols.
        </div>
      </section>
    </div>
  );
}
