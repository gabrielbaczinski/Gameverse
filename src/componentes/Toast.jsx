import React, { Fragment } from 'react';
import { Transition } from '@headlessui/react';
import { CheckCircleIcon, XCircleIcon, XMarkIcon, InformationCircleIcon } from '@heroicons/react/24/outline';

export default function ToastAlert({ show, message, type, onClose }) {
  return (
    <Transition
      show={show}
      as={Fragment}
      enter="transform ease-out duration-300 transition"
      enterFrom="translate-y-2 opacity-0 sm:translate-y-0 sm:translate-x-2"
      enterTo="translate-y-0 opacity-100 sm:translate-x-0"
      leave="transition ease-in duration-100"
      leaveFrom="opacity-100"
      leaveTo="opacity-0"
    >
      <div className="fixed bottom-4 right-4 z-[9999] min-w-[350px]">
        <div className={`toast-alert ${type}`}>
          <div className="flex-shrink-0">
            {type === 'success' && <CheckCircleIcon className="h-6 w-6 text-white" />}
            {type === 'error' && <XCircleIcon className="h-6 w-6 text-white" />}
            {type === 'info' && <InformationCircleIcon className="h-6 w-6 text-white" />}
          </div>
          <div className="flex-1">
            <p className="text-white">{message}</p>
          </div>
          <div className="flex-shrink-0">
            <button
              className="rounded-md text-white hover:opacity-80 focus:outline-none"
              onClick={onClose}
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </Transition>
  );
}
