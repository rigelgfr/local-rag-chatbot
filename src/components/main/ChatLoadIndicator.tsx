import { Loading } from "../custom-ui/Loading";

export default function ChatLoadIndicator() {
  return (
    <div className="flex justify-start">
      <div className="border text-foreground bg-background px-4 py-2 rounded-lg rounded-tl-none max-w-xs">
        <div className="flex items-center space-x-2">
          <Loading />
        </div>
      </div>
    </div>
  );
}
