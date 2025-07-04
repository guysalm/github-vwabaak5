import React from 'react'
import { X, Navigation, MapPin, Car, Smartphone } from 'lucide-react'

interface NavigationModalProps {
  isOpen: boolean
  onClose: () => void
  address: string
  customerName: string
}

const NavigationModal: React.FC<NavigationModalProps> = ({
  isOpen,
  onClose,
  address,
  customerName
}) => {
  if (!isOpen) return null

  const encodedAddress = encodeURIComponent(address)
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent)
  const isAndroid = /Android/.test(navigator.userAgent)

  const navigationOptions = [
    {
      name: 'Google Maps',
      icon: MapPin,
      color: 'bg-green-600 hover:bg-green-700',
      action: () => {
        if (isMobile) {
          // Try native app first, fallback to web
          const nativeUrl = `comgooglemaps://?q=${encodedAddress}`
          const webUrl = `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`
          
          window.location.href = nativeUrl
          setTimeout(() => {
            window.open(webUrl, '_blank')
          }, 1500)
        } else {
          window.open(`https://www.google.com/maps/search/?api=1&query=${encodedAddress}`, '_blank')
        }
      }
    },
    {
      name: 'Apple Maps',
      icon: Navigation,
      color: 'bg-blue-600 hover:bg-blue-700',
      show: isIOS,
      action: () => {
        const appleMapsUrl = `maps://maps.google.com/maps?q=${encodedAddress}`
        window.location.href = appleMapsUrl
      }
    },
    {
      name: 'Waze',
      icon: Car,
      color: 'bg-purple-600 hover:bg-purple-700',
      action: () => {
        if (isMobile) {
          const wazeUrl = `waze://?q=${encodedAddress}`
          const webUrl = `https://waze.com/ul?q=${encodedAddress}`
          
          window.location.href = wazeUrl
          setTimeout(() => {
            window.open(webUrl, '_blank')
          }, 1500)
        } else {
          window.open(`https://waze.com/ul?q=${encodedAddress}`, '_blank')
        }
      }
    },
    {
      name: 'Default Maps',
      icon: Smartphone,
      color: 'bg-gray-600 hover:bg-gray-700',
      show: isMobile,
      action: () => {
        if (isAndroid) {
          window.location.href = `geo:0,0?q=${encodedAddress}`
        } else if (isIOS) {
          window.location.href = `maps://?q=${encodedAddress}`
        } else {
          window.open(`https://www.google.com/maps/search/?api=1&query=${encodedAddress}`, '_blank')
        }
      }
    }
  ]

  const handleOptionClick = (option: any) => {
    option.action()
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center space-x-2">
            <Navigation className="h-6 w-6 text-blue-600" />
            <span>Choose Navigation App</span>
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6">
          <div className="mb-4">
            <h3 className="font-medium text-gray-900 mb-1">Navigate to:</h3>
            <p className="text-gray-600 text-sm">{customerName}</p>
            <p className="text-gray-600 text-sm">{address}</p>
          </div>

          <div className="space-y-3">
            {navigationOptions
              .filter(option => option.show !== false)
              .map((option, index) => {
                const IconComponent = option.icon
                return (
                  <button
                    key={index}
                    onClick={() => handleOptionClick(option)}
                    className={`w-full ${option.color} text-white p-4 rounded-lg font-medium transition-all transform hover:scale-105 shadow-md flex items-center space-x-3`}
                  >
                    <IconComponent className="h-5 w-5" />
                    <span>Open in {option.name}</span>
                  </button>
                )
              })}
          </div>

          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-blue-700 text-xs">
              💡 Tip: If an app doesn't open, it may not be installed on your device. 
              The web version will open as a backup.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default NavigationModal