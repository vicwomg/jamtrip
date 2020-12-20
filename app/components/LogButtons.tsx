import React from 'react';

const LogButtons = ({
  onClear,
  onCopy,
  onHide,
}: {
  onClear: () => void;
  onCopy: () => void;
  onHide: () => void;
}) => (
  <div className="is-flex" style={{ justifyContent: 'flex-end' }}>
    <div style={{ marginTop: 10 }}>
      <button
        type="button"
        className="button is-small is-rounded is-danger is-outlined"
        onClick={onClear}
        style={{ marginRight: 10 }}
      >
        <i className="fas fa-trash" />
        &nbsp;clear
      </button>
      <button
        className="button is-small is-rounded"
        type="button"
        onClick={onCopy}
        style={{ marginRight: 10 }}
      >
        <i className="fas fa-copy" />
        &nbsp;copy
      </button>
      <button
        type="button"
        className="button is-small is-rounded"
        onClick={onHide}
      >
        <i className="fas fa-eye" />
        &nbsp;hide
      </button>
    </div>
  </div>
);

export default LogButtons;
