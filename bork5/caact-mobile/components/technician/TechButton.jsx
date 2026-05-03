import Button from "../ui/Button";
import { COLORS } from "../../constants/theme";

export default function TechButton(props) {
  return <Button accentColor={COLORS.tech} {...props} />;
}
