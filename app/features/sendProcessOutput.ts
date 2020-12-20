import { ChildProcessWithoutNullStreams } from 'child_process';

const sendProcessOutput = (
  textareaRef: React.RefObject<HTMLTextAreaElement>,
  output: ChildProcessWithoutNullStreams | string
) => {
  if (typeof output === 'string') {
    if (textareaRef && textareaRef.current != null) {
      textareaRef.current.value += `${output}\n`;
      textareaRef.current.scrollTop = textareaRef.current.scrollHeight;
    }
  } else {
    output.stdout.on('data', (data) => {
      if (textareaRef && textareaRef.current != null) {
        textareaRef.current.value += data.toString();
        textareaRef.current.scrollTop = textareaRef.current.scrollHeight;
      }
    });
    output.stderr.on('data', (data) => {
      if (textareaRef && textareaRef.current != null) {
        textareaRef.current.value += data.toString();
        textareaRef.current.scrollTop = textareaRef.current.scrollHeight;
      }
    });
  }
};

export default sendProcessOutput;
