const resetValue = (event, init, onChange) => {
  event.target.value = init;
  event.target.name = event.target.attributes.name.value;
  onChange(event, init);
}

const FilterListItem = ({ filter, range, adjustmentList, onChange }) => {
  const min = range["min"] != null ? range["min"] : -100;
  const max = range["max"] != null ? range["max"] : 100;
  const step = range["step"] || 1;
  const init = range["init"] || 0;
  const curValue = adjustmentList[filter] != null ? adjustmentList[filter] : init;

  return (
    <div className="col">
      <div className="row gx-1 hover">
        <label name={filter} className="col-3" onClick={(event) => resetValue(event, init, onChange)}>{filter}</label>
        <div className="col-8">
          <input id={filter} name={filter} className="form-range slider"
            type="range" min={min} max={max} step={step}
            value={curValue} onChange={(event) => onChange(event, init)} />
        </div>
        <span name={filter} className="col-1" onClick={(event) => resetValue(event, init, onChange)}>{curValue}</span>
      </div>
    </div>
  );
};

export default FilterListItem;
