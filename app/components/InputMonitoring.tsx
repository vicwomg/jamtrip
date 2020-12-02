import React from 'react';
import { configureInputMonitoring } from '../features/jackInterface';
import { getPersistence, setPersistence } from '../features/persistence';

const InputMonitoringButton = () => {
  const [inputMonitoring, setInputMonitoring] = React.useState<boolean>(true);

  React.useEffect(() => {
    getPersistence('direct_input_monitoring', (value) => {
      setInputMonitoring(value === 'true');
    });
  }, []);

  return (
    <>
      <button
        type="button"
        className="button is-rounded has-background-light"
        onClick={() => {
          const newSetting = !inputMonitoring;
          configureInputMonitoring(newSetting);
          setInputMonitoring(newSetting);
          setPersistence('direct_input_monitoring', newSetting);
        }}
      >
        {inputMonitoring ? (
          <>
            <i className="fas fa-microphone has-text-success" />
          </>
        ) : (
          <>
            <i className="fas fa-microphone-slash has-text-danger" />
          </>
        )}
        &nbsp; Direct input monitoring
      </button>
    </>
  );
};

export default InputMonitoringButton;
