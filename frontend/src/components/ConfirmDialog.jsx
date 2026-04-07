export default function ConfirmDialog({ dialog, onCancel, onConfirm, copy }) {
  if (!dialog) {
    return null;
  }

  return (
    <div className="modal-backdrop" onClick={onCancel}>
      <article className="confirm-dialog" role="dialog" aria-modal="true" onClick={(event) => event.stopPropagation()}>
        <div className="subheading">
          <h3>{dialog.title || copy.confirmTitle}</h3>
        </div>
        <p>{dialog.description}</p>
        <div className="confirm-dialog-actions">
          <button className="button secondary" type="button" onClick={onCancel}>
            {copy.confirmCancel}
          </button>
          <button
            className={`button ${dialog.intent === "danger" ? "danger" : "primary"}`}
            type="button"
            onClick={onConfirm}
          >
            {dialog.confirmLabel}
          </button>
        </div>
      </article>
    </div>
  );
}
