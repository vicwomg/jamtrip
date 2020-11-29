import { ChildProcessWithoutNullStreams } from 'child_process';

const sendProcessOutput = (
  textareaRef: React.MutableRefObject<null>,
  childProcess: ChildProcessWithoutNullStreams
) => {
  childProcess.stdout.on('data', (data) => {
    if (textareaRef && textareaRef.current != null) {
      textareaRef.current.value += data.toString();
    }
  });
  childProcess.stderr.on('data', (data) => {
    if (textareaRef && textareaRef.current != null) {
      textareaRef.current.value += data.toString();
    }
  });
};

export default sendProcessOutput;
