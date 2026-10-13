import { useState, useEffect, useCallback } from 'react';

export const useKeyboard = () => {
  const [actions, setActions] = useState({
    moveForward: false,
    moveBackward: false,
    moveLeft: false,
    moveRight: false,
    jump: false,
    texture1: false,
    texture2: false,
    texture3: false,
    texture4: false,
    texture5: false,
  });

  //FUNCTION TO MAP EACH KEY.CODE VALUE TO AN ACTION FOR THE GAME
  const actionByKey = useCallback((key: string) => {
    const keyActionMap: Record<string, keyof typeof actions> = {
      KeyW: 'moveForward',
      KeyS: 'moveBackward',
      KeyA: 'moveLeft',
      KeyD: 'moveRight',
      Space: 'jump',
    };

    return keyActionMap[key] ?? null;
  }, []);
  // HANDLE KEY ACTIONS AND TRACK THEIR STATE
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    const action = actionByKey(event.code);
    if (!action) return;
    setActions((prevAction) => ({ ...prevAction, [action]: true }));
  }, [actionByKey]);


  const handleKeyUp = useCallback((event: KeyboardEvent) => {
    const action = actionByKey(event.code);
    if (!action) return;

    setActions((prevAction) => ({ ...prevAction, [action]: false }));
  }, [actionByKey]);
// **********************************************
  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keyup', handleKeyUp);
    };
  }, [handleKeyDown, handleKeyUp]);

  return actions;
};
