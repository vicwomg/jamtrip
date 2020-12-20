/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import classnames from 'classnames';
import React from 'react';

const LogModal = ({
  isActive,
  onClose,
  outputLogRef,
}: {
  isActive: boolean;
  onClose: () => void;
  outputLogRef: React.RefObject<HTMLTextAreaElement>;
}) => {
  return (
    <>
      <div className={classnames('modal', { 'is-active': isActive })}>
        <div className="modal-background" onClick={onClose} />
        <div className="modal-card" style={{ width: '95%' }}>
          <header className="modal-card-head" style={{ padding: 10 }}>
            <p className="modal-card-title has-text-centered">Log output</p>
            <button
              className="delete"
              aria-label="close"
              type="button"
              onClick={onClose}
            />
          </header>
          <section className="modal-card-body" style={{ padding: 0 }}>
            <textarea
              className="textarea has-background-dark has-text-success is-size-7"
              name="output"
              ref={outputLogRef}
              id="output"
              rows={25}
              style={{ width: '100%' }}
            />
          </section>
          <footer
            className="modal-card-foot"
            style={{ padding: 10, paddingTop: 10 }}
          >
            <div className="pulled-right" style={{ width: '100%' }}>
              <button
                type="button"
                className="button is-small is-rounded is-danger is-outlined"
                onClick={() => {
                  if (outputLogRef.current) {
                    outputLogRef.current.value = '';
                  }
                }}
                style={{ marginRight: 10 }}
              >
                <i className="fas fa-trash" />
                &nbsp;clear
              </button>
              <button
                className="button is-small is-rounded"
                type="button"
                onClick={() => {
                  if (outputLogRef.current) {
                    outputLogRef.current.select();
                    document.execCommand('copy');
                  }
                }}
              >
                <i className="fas fa-copy" />
                &nbsp;copy
              </button>
            </div>
          </footer>
        </div>
      </div>
    </>
  );
};

export default LogModal;
