import React from 'react';

const LogButtons = ({
  onClear,
  onCopy,
}: {
  onClear: () => void;
  onCopy: () => void;
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
      >
        <i className="fas fa-copy" />
        &nbsp;copy
      </button>
    </div>
  </div>
);

export default LogButtons;
