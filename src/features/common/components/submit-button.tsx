import { Button } from "@/components/ui/button";
import { useFormContext } from "../hooks/form-context";

export default function SubmitButton() {
  const form = useFormContext();
  return (
    <form.Subscribe selector={(state) => state.canSubmit}>
      {(canSubmit) => (
        <div>
          <Button
            disabled={!canSubmit}
            type="submit"
            onClick={() => form.handleSubmit({ submitAction: "save" })}
          >
            Save
          </Button>
          <Button
            disabled={!canSubmit}
            type="submit"
            onClick={() => form.handleSubmit({ submitAction: "goback" })}
          >
            Save & Go back
          </Button>
        </div>
      )}
    </form.Subscribe>
  );
}
