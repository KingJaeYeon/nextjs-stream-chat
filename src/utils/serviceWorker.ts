export async function registerServiceWorker() {
  if (!("serviceWorker" in navigator)) {
    throw Error("Service workers are not supported by this browser");
  }
  await navigator.serviceWorker.register("/serviceWorker.js");
}

export async function getReadyServiceWorker() {
  if (!("serviceWorker" in navigator)) {
    throw Error("Service workers are not supported by this browser");
  }
  return navigator.serviceWorker.ready;
}

// First
// 1. ChatPage => useEffect 에서 registerServiceWorker 호출
// 2. registerServiceWorker => navigator.serviceWorker.register("/serviceWorker.js") 호출 (serviceWorker.js 파일을 브라우저에 등록)

// Second
// 1. PushSubscriptionToggleButton => useEffect 에서 getCurrentPushSubscription 호출
// 2. getCurrentPushSubscription => sw를 지원하는 브라우저면 navigator.serviceWorker.ready(sw) 호출
// 3. navigator.serviceWorker.ready(sw) => sw가 준비되면 sw.pushManager.getSubscription() 호출

// Third
// 1. sw.pushManager.getSubscription() => undefined 일 경우 return null.
// 2. sw.pushManager.getSubscription() 값이 있을 경우 setHasActivePushSubscription()에 true 저장 후 component return
// 3. hasActivePushSubscription 값에 따라 registerPushNotifications() 또는 unregisterPushNotifications() 호출
// 4.
