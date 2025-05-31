import React from "react";

const PrefList = React.memo(function PrefList({
  prefs,
  checkedPrefs,
  handlePrefChange,
}: {
  prefs: { prefCode: number; prefName: string }[];
  checkedPrefs: Record<number, boolean>;
  handlePrefChange: (code: number) => void;
}) {
  return (
    <div className="pref__list">
      {prefs?.map((pref) => (
        <div key={`pref_${pref.prefCode}`} className="pref__radio">
          <label>
            <input
              type="checkbox"
              checked={checkedPrefs[pref.prefCode]}
              onChange={() => handlePrefChange(pref.prefCode)}
              name={`pref_${pref.prefCode}`}
            />
            {pref.prefName}
          </label>
        </div>
      ))}
    </div>
  );
});
export default PrefList;