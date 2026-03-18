// Some sort of typedef

// const ACTION_CLOSE = { label: "Close", action: "close" };
// const ACTION_CANCEL = { label: "Cancel", action: "close" };
// const ACTION_OK = { label: "OK", action: "close" };

export type ModalAction = { label: string; action: string | Function };

// This MUST match the vanilla JS implementation!!!
export type Modal = {
  ACTION_CLOSE: ModalAction;
  ACTION_CANCEL: ModalAction;
  ACTION_OK: ModalAction;
  setTitle: (title: string) => void;
  setActions: (actions: Array<ModalAction>) => void;
  setFooter: (footer: string) => void;
  setBody: (body: string | HTMLElement) => void;
  open: () => void;
  close: () => void;
};

// setTitle("Export STL");
//     appContext.modal.setFooter("");
//     appContext.modal.setActions([
//       setBody
