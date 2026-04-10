# Explanation of `submit.tsx`

This document explains what is happening inside the `submit.tsx` file in simple terms, focusing specifically on how it connects to **TanStack Query** (React Query) and **Zustand**.

## 1. The Big Picture
The `SubmitScreen` component is the first screen a user sees. Its job is to take a **Company Code** from the user, send it to the server to verify if it's tied to a valid company, and if so, save that company's configuration (like their specific server URL). This ensures the rest of the app knows how to talk to the correct company's server. After a successful check, it sends the user to the login screen.

## 2. What is TanStack (React Query)?
Inside the code, you'll see this line:
```typescript
const { mutate: submitCode, isPending } = useCompanyConfig();
```

**TanStack Query** (formerly React Query) is a tool used to talk to servers (APIs) and manage the data that comes back. 

Instead of manually writing a `fetch` request and using multiple `setState` hooks to track if the request is loading or has failed, TanStack does all that heavy lifting for you.

In this file:
- **`useCompanyConfig()`**: A custom hook pulling in TanStack's `useMutation`. A "mutation" is what TanStack calls any request that changes data (like POSTing a company code to a server).
- **`submitCode` (renamed from `mutate`)**: This is the function you trigger when the user presses the "Verify & Continue" button.
- **`isPending`**: This is a boolean (`true` or `false`) that TanStack automatically updates. It is `true` while the request is traveling to the server and waiting for an answer. The code cleverly uses this to disable the button and show a spinning loading wheel (`ActivityIndicator`) so the user can't spam the button or change the text (`editable={!isPending}`) during the request.

When you call `submitCode(companyId.trim(), { onSuccess, onError })`, it triggers the API call. If the API succeeds, the `onSuccess` block runs. If the server crashes or internet disconnects, the `onError` block kicks in, throwing a neat toast notification (`toast.show('error', ...)`).

## 3. What is Zustand?
**Zustand** is a way to share data across your entire app (Global State Management). 

Imagine you fetch the company's server URL on this submit screen, but you need that same URL on the Login screen, the Dashboard, and the Profile screen. Instead of passing it down manually screen-by-screen (which gets messy fast), you put it in a "global store" (like a shared box).

If you look at how `useCompanyConfig` is defined in the project:
```typescript
export const useCompanyConfig = () => {
    const setConfig = useConfigStore((state) => state.setConfig);

    return useMutation({
        mutationFn: getCompanyConfig,
        onSuccess: (data) => {
            // Store company config in Zustand
            setConfig(data);
        },
    });
};
```
When your TanStack API call succeeds, it silently runs `setConfig(data);` behind the scenes. 
`setConfig` is a Zustand function. It saves the `data` (the company's API URL and details) into the Zustand store. Once it's in the store, *any* other file in your app can instantly read it whenever it needs to.

Additionally, this project uses Zustand's `persist` middleware (seen in `authStore.ts`), which automatically saves this data to the phone's local storage (`AsyncStorage`). So, if the user closes and reopens the app, the app immediately remembers their company code!

## 4. Step-by-Step Flow of the Component
Here is exactly what happens when a user touches this screen:

1. **Initial Setup**: The screen loads. It uses standard React hooks like `useState` to keep track of what the user is typing (`companyId`) and whether the keyboard is open (`isKeyboardVisible`).
2. **Back Button Override**: A `useEffect` block detects if the user presses the physical back button on an Android phone. If they do, it exits the app entirely rather than navigating back to a blank or weird screen.
3. **User Typs**: The user types their company code into the `TextInput`.
4. **Validation Check**: When the user presses the button, `handleSubmit` checks if the input is empty. If it is, a neat toast error appears ("Please enter a Company Code") and it stops there.
5. **API Call (TanStack time)**: If valid, it fires `submitCode(companyId, ...)`. TanStack immediately flips `isPending` to `true`, replacing the button text with a loading spinner.
6. **Success**: If the server replies with Status 200 (which means OK):
   - Behind the scenes, Zustand saves the company config globally.
   - A success toast pops up ("Company Code Valid").
   - A timer starts (`setTimeout`). After 2.5 seconds, the router automatically pushes the user to the `/(auth)/login` screen.
7. **Error**: If the server rejects the code (e.g., status 400), an error toast is shown ("Invalid Code"), and the user can try again unharmed.

## Summary
- **The Visuals**: The screen takes a company code, manages the keyboard, and makes everything look polished with nice themes.
- **TanStack (`submitCode`)**: Does the heavy lifting of talking to the server, telling the UI when to show a loading spinner (`isPending`), and cleanly handling success/error responses.
- **Zustand (`setConfig`)**: Silently catches the server's successful response behind the scenes and caches the config globally so the rest of the app knows what server setup it's using.
