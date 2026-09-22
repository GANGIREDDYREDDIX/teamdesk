import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import * as store from '../lib/mockStore.js'

const StoreContext = createContext(null)

export function StoreProvider({ children }) {
  const [storeState, setStoreState] = useState(() => store.getStore())

  useEffect(() => {
    const unsub = store.subscribe((s) => setStoreState(s))
    return unsub
  }, [])

  // Expose stable action refs
  const actions = {
    // Tasks
    createTask:        (...a) => store.createTask(...a),
    updateTask:        (...a) => store.updateTask(...a),
    acknowledgeTask:   (...a) => store.acknowledgeTask(...a),
    startWork:         (...a) => store.startWork(...a),
    updateProgress:    (...a) => store.updateProgress(...a),
    reportBlocker:     (...a) => store.reportBlocker(...a),
    resumeWork:        (...a) => store.resumeWork(...a),
    submitForReview:   (...a) => store.submitForReview(...a),
    reviewTask:        (...a) => store.reviewTask(...a),
    cancelTask:        (...a) => store.cancelTask(...a),
    reassignTask:      (...a) => store.reassignTask(...a),
    changeDeadline:    (...a) => store.changeDeadline(...a),
    // Checklist
    toggleChecklistItem: (...a) => store.toggleChecklistItem(...a),
    addChecklistItem:    (...a) => store.addChecklistItem(...a),
    // Comments
    addComment:          (...a) => store.addComment(...a),
    // Extensions
    requestExtension:    (...a) => store.requestExtension(...a),
    decideExtension:     (...a) => store.decideExtension(...a),
    // Employees
    inviteEmployee:      (...a) => store.inviteEmployee(...a),
    deactivateEmployee:  (...a) => store.deactivateEmployee(...a),
    reactivateEmployee:  (...a) => store.reactivateEmployee(...a),
    updateProfile:       (...a) => store.updateProfile(...a),
    // Departments
    createDepartment:    (...a) => store.createDepartment(...a),
    updateDepartment:    (...a) => store.updateDepartment(...a),
    deleteDepartment:    (...a) => store.deleteDepartment(...a),
    // Org
    updateOrg:           (...a) => store.updateOrg(...a),
    // Notifications
    markNotificationRead:    (...a) => store.markNotificationRead(...a),
    markAllNotificationsRead:(...a) => store.markAllNotificationsRead(...a),
    // Misc
    resetToSeedData: store.resetToSeedData,
  }

  return (
    <StoreContext.Provider value={{ ...storeState, actions }}>
      {children}
    </StoreContext.Provider>
  )
}

export function useStore() {
  const ctx = useContext(StoreContext)
  if (!ctx) throw new Error('useStore must be used inside StoreProvider')
  return ctx
}

// Convenience selectors
export function useTasks() {
  const { tasks } = useStore()
  return tasks
}

export function useTask(id) {
  const { tasks } = useStore()
  return tasks.find(t => t.id === id) || null
}

export function useNotifications(userId) {
  const { notifications } = useStore()
  return notifications
    .filter(n => n.recipient_id === userId)
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
}
