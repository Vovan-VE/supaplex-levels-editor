import { renderPrompt } from "ui/feedback";
import { SignatureEdit } from "./SignatureEdit";

export const openSignatureEdit = () =>
  renderPrompt<undefined>((props) => <SignatureEdit {...props} />);
