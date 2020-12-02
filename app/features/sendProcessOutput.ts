import { ChildProcessWithoutNullStreams } from 'child_process';

const sendProcessOutput = (
  textareaRef: React.MutableRefObject<null>,
  childProcess: ChildProcessWithoutNullStreams
) => {
  childProcess.stdout.on('data', (data) => {
    if (textareaRef && textareaRef.current != null) {
      textareaRef.current.value += data.toString();
      textareaRef.current.scrollTop = textareaRef.current.scrollHeight;
    }
  });
  childProcess.stderr.on('data', (data) => {
    if (textareaRef && textareaRef.current != null) {
      textareaRef.current.value += data.toString();
      textareaRef.current.scrollTop = textareaRef.current.scrollHeight;
    }
  });
};

export default sendProcessOutput;
