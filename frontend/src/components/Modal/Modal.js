import "./Modal.css";

const Modal = (props) => (
  <div className="modal">
    <section className="modal__header">
      <h1>{props.title}</h1>
    </section>
    <section className="modal__content">{props.children}</section>
    <section className="modal__actions">
      <div className="center-buttons">
        <button className="btn" onClick={props.onCancel}>
          Cancel
        </button>
        <button className="btn" onClick={props.onConfirm}>
          {props.confirmText}
        </button>
      </div>
    </section>
  </div>
);
export default Modal;
