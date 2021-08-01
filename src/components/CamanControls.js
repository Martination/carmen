import { PresetButton } from './Bootstrap';
import FilterListItem from './FilterListItem';

export function CreatePresetList({ presetList, onClick }) {
  const presets = [
    "vintage", "lomo", "clarity", "sinCity", "sunrise", "crossProcess", "orangePeel",
    "love", "grungy", "jarques", "pinhole", "oldBoot", "glowingSun",
    "hazyDays", "herMajesty", "nostalgia", "hemingway", "concentrate"
  ];

  const presetsPretty = [
    "Vintage", "Lomo", "Clarity", "Sin City", "Sunrise", "Cross Process", "Orange Peel",
    "Love", "Grungy", "Jarques", "Pinhole", "Old Boot", "Glowing Sun",
    "Hazy Days", "Her Majesty", "Nostalgia", "Hemingway", "Concentrate"
  ];

  let buttonList = [];
  for (const [index, preset] of presets.entries()) {
    const isActive = presetList[preset] ? true : false;
    buttonList.push(
      <PresetButton key={preset} preset={preset} presetName={presetsPretty[index]}
        onClick={onClick} active={isActive} />
    );
  }
  return buttonList;
}

export function CreateFilterList({ filterList, onChange }) {
  // -100 to 100
  const filtersFullRange = ["brightness", "contrast", "vibrance", "saturation", "exposure"];
  // 0 to 100
  const filtersHalfRange = ["hue", "sepia", "noise", "sharpen", "clip"];
  const filtersSpecial = { "gamma": { "min": 0, "init": 1, "max": 10, "step": 0.1 } };

  let rangeList = {};

  const rangeFull = { "min": -100, "init": 0, "max": 100 };
  // Must be for...of; for...in replaces names with indicies
  for (const filter of filtersFullRange) { rangeList[filter] = rangeFull; }

  const rangeHalf = { "min": 0, "init": 0, "max": 100 };
  for (const filter of filtersHalfRange) { rangeList[filter] = rangeHalf; }
  rangeList = { ...rangeList, ...filtersSpecial };

  let filters = [];
  // Must be for...in, rangeList isn't iterable
  for (const filter in rangeList) {
    filters.push(
      <FilterListItem key={filter} filter={filter} range={rangeList[filter]}
        filterList={filterList} onChange={onChange} />
    );
  }

  return filters;
}
