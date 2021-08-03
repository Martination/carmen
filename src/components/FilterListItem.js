function FilterListItem({ filter, range, filterList, onChange }) {
  const min = range['min'] != null ? range['min'] : -100;
  const max = range['max'] != null ? range['max'] : 100;
  const step = range['step'] || 1;
  const init = range['init'] || 0;
  const curValue = (filterList[filter] != null) ? filterList[filter] : init;

  function resetValue(event) {
    event.target.value = init;
    event.target.name = event.target.attributes.name.value;
    onChange(event, init);
  }

  return (
    <div className="col">
      <div className="row gx-1 hover">
        <button className="col-3 reset btn-secondary border-0 text-capitalize"
          name={filter} htmlFor={filter} onClick={resetValue}>{filter}</button>

        <div className="col-8">
          <input id={filter} name={filter} aria-label={filter} type="range"
            min={min} max={max} step={step} className="form-range slider pt-2"
            value={curValue} onChange={(event) => onChange(event, init)} />
        </div>

        <button className="reset col-1 btn-secondary border-0"
          type="button" name={filter} onClick={resetValue}>{curValue}</button>
      </div>
    </div>
  );
};

export default FilterListItem;
