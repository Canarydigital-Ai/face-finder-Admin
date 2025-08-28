import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';

interface DropdownProps {
    placement?: 'bottom-start' | 'bottom-end' | 'top-start' | 'top-end';
    offset?: [number, number];
    btnClassName?: string;
    button: React.ReactNode;
    children: React.ReactNode;
}

const Dropdown = (
    { placement = 'bottom-start', offset = [0, 8], btnClassName, button, children }: DropdownProps,
    forwardedRef: React.Ref<{ close: () => void }>
) => {
    const [visibility, setVisibility] = useState(false);
    const [position, setPosition] = useState({ top: 0, left: 0 });
    const referenceRef = useRef<HTMLButtonElement>(null);
    const popperRef = useRef<HTMLDivElement>(null);

    const updatePosition = () => {
        if (referenceRef.current && popperRef.current) {
            const refRect = referenceRef.current.getBoundingClientRect();
            const popperRect = popperRef.current.getBoundingClientRect();

            let top = 0;
            let left = 0;

            switch (placement) {
                case 'bottom-start':
                    top = refRect.bottom + offset[1];
                    left = refRect.left + offset[0];
                    break;
                case 'bottom-end':
                    top = refRect.bottom + offset[1];
                    left = refRect.right - popperRect.width + offset[0];
                    break;
                case 'top-start':
                    top = refRect.top - popperRect.height - offset[1];
                    left = refRect.left + offset[0];
                    break;
                case 'top-end':
                    top = refRect.top - popperRect.height - offset[1];
                    left = refRect.right - popperRect.width + offset[0];
                    break;
            }

            setPosition({ top, left });
        }
    };

    const handleDocumentClick = (event: MouseEvent) => {
        if (
            referenceRef.current?.contains(event.target as Node) ||
            popperRef.current?.contains(event.target as Node)
        ) {
            return;
        }
        setVisibility(false);
    };

    useEffect(() => {
        document.addEventListener('mousedown', handleDocumentClick);
        return () => {
            document.removeEventListener('mousedown', handleDocumentClick);
        };
    }, []);

    useEffect(() => {
        if (visibility) {
            updatePosition();
        }
    }, [visibility]);

    useImperativeHandle(forwardedRef, () => ({
        close() {
            setVisibility(false);
        },
    }));

    return (
        <>
            <button
                ref={referenceRef}
                id="open-column-btn"
                type="button"
                className={btnClassName}
                onClick={() => setVisibility(!visibility)}
            >
                {button}
            </button>

            {visibility && (
                <div
                    ref={popperRef}
                    id="drop-down"
                    className="z-50"
                    style={{
                        position: 'absolute',
                        top: `${position.top}px`,
                        left: `${position.left}px`,
                    }}
                    onClick={() => setVisibility(!visibility)}
                >
                    {children}
                </div>
            )}
        </>
    );
};

export default forwardRef(Dropdown);
