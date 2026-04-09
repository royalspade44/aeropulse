const confirmDialog = (message, title = 'Please Confirm') => {
  return new Promise((resolve) => {
    window.dispatchEvent(
      new CustomEvent('app:dialog', {
        detail: { type: 'confirm', title, message, resolve }
      })
    );
  });
};

export { confirmDialog };
