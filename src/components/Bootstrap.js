import { useEffect, useRef } from 'react';
import { Button, Toast } from 'bootstrap';

export function PresetButton({ preset, presetName, onClick, active }) {
  const buttonRef = useRef();

  let myButton = buttonRef.current;
  let bsButton = Button.getInstance(myButton);

  if (!bsButton) { bsButton = new Button(myButton, { toggle: "button" }); }

  return (
    <div className="col p-1 d-grid">
      <button className={`preset btn btn-primary ${active ? 'active' : null}`}
        ref={buttonRef} id={preset} onClick={(event) => { onClick(event) }} type="button">
        {`${presetName}`}
      </button>
    </div>
  );
}

export function NotificationToast({ toast, setToast, status, toastText }) {
  const toastRef = useRef();

  useEffect(() => {
    let myToast = toastRef.current;
    let bsToast = Toast.getInstance(myToast);

    if (!bsToast) {
      bsToast = new Toast(myToast, { autohide: false });
    } else {
      toast ? bsToast.show() : bsToast.hide();
    }
  }, [toast]);

  return (
    <>
      <div className="position-fixed bottom-0 end-0 pe-3 pb-3">
        <div className="toast hide" role="status" aria-live="polite" aria-atomic="true" ref={toastRef}>
          <div className="toast-header text-primary">
            <i className="bi bi-image-fill pe-1"></i>
            <strong className="me-auto">Carmen Uploader</strong>
            <small>{status ? "Success" : "Failure"}</small>
            <button type="button" className="btn-close" aria-label="Close"
              onClick={() => setToast(toast => !toast)} />
          </div>
          <div className="toast-body text-dark">{toastText}</div>
        </div>
      </div>
    </>
  );
}
