const FilterListItem = ({ filter, adjustmentList, onChange }) => {
  // console.log("FilterList rendering", adjustmentList)
  const curValue = adjustmentList[filter] || 0;
  return (
    <div className="col">
      <div className="row gx-1">
        <label htmlFor={filter} className="col-3">{filter}</label>
        <div className="col-8">
          <input id={filter} className="form-range slider"
            type="range" min="-100" max="100" step="1"
            value={curValue} onChange={onChange} />
        </div>
        <span className="col-1">{curValue}</span>
      </div>
    </div>
  );
};

export default FilterListItem;
