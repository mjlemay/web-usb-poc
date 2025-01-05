'use client'
import { useState, useEffect } from 'react';

type USBDevice = {
    productName: string,
    manufacturerName: string,
    serialNumber: string,
    protocolCode: number,
    deviceClassCode: number,
    deviceSubclassCode: number,
}

export default function USBDeviceDiagnostics() {
    const [usbDevices, setUsbDevices] = useState([]);
    const [usbData, setUSBData] = useState('');
    const [navigatorReady, setNavigatorReady] = useState(false);

    const addUSBListeners = () => {
        navigator.usb.addEventListener("disconnect", (event) => {
            console.log('disconnect', event);
            fetchUSBDevices()
        });
        navigator.usb.addEventListener("connect", (event) => {
            console.log('connect', event);
            fetchUSBDevices();
        });
    }

    const openUSBDevice = async (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        const target = event.currentTarget as HTMLElement;
        const serialNumber = target.getAttribute('data-serial_number') || '';
        console.log('filtering on serial: ', serialNumber);
        const device = await navigator.usb.requestDevice({ filters: [{ 'serialNumber': serialNumber }] })
        .catch(error => { 
            console.log('device selection error', error);
         });
        console.log('device', device);
         if (device){
            await device.open(); // Begin a session.
            await device.selectConfiguration(1);
            await device.claimInterface(1); 
            // await device.controlTransferOut({
            //     requestType: 'class',
            //     recipient: 'interface',
            //     request: 0x22,
            //     value: 0x01,
            //     index: 0x02
            // });
            
            // Ready to receive data
            // const result = await device.transferIn(5, 64).then(data => {
            //     // const decoder = new TextDecoder();
            //     // const decodedData = decoder.decode(data);
            //     setUSBData(data as string);
            //     console.log('transferIn', data)
        }
    }

    const requestUSBDevices = async () => {
        const deviceList = navigator ? await navigator.usb.requestDevice()
            .then(devices => { return devices })
            .catch(error => { return error })
            : null;
        console.log(deviceList);
    }

    const fetchUSBDevices = async () => {
        const deviceList = navigator ? await navigator.usb.getDevices()
            .then(devices => {
                devices.map(device => {
                    console.log(device);
                });
                return devices;
            })
            .catch(error => { return error })
            : null;
        setUsbDevices(deviceList);
    }

    const getUSBDeviceDiagnostics = () => {
        if (navigatorReady) {
            return (
                <>
                    <h2>USB Device Diagnostics</h2>
                    <div className="my-4">
                        <button
                            onClick={() => requestUSBDevices()}
                            className="bg-neutral-500 hover:bg-neutral-700 text-white font-bold py-1 px-2 rounded"
                        >
                            Request USB Device
                        </button>
                    </div>
                    <div className="my-2">
                        {usbDevices && usbDevices.map((device:USBDevice) => {
                            return (
                                <div
                                    onClick={event => openUSBDevice(event)}
                                    className="hover:bg-neutral-900 rounded cursor-pointer"
                                    key={`serial_${device.serialNumber}`}
                                    data-serial_number={device.serialNumber}
                                    data-protocol_code={device.protocolCode}
                                    data-device_class_code={device.deviceClassCode}
                                    data-device_subclass_code={device.deviceSubclassCode}
                                >
                                    <span className="text-lg front-bold">{device.productName}</span>
                                    <span className="text-lg front-light px-2 text-neutral-600">{device.manufacturerName}</span>
                                </div>
                            )
                        })}
                    </div>
                    <div className="my-2 border border-neutral-500 rounded p-2 min-h-[100px]">
                        <pre>{usbData}</pre>
                    </div>
                </>
            )
        } else {
            return (
                <>
                    <h2>USB Device Diagnostics</h2>
                    <p>WebUSB is not supported in your browser.</p>
                </>
            )
        }
    };

    useEffect(() => {
        setNavigatorReady(true);
        fetchUSBDevices();
        addUSBListeners();
    }, []);

    return (
        <div className="">
            {getUSBDeviceDiagnostics()}
        </div>
    );
}