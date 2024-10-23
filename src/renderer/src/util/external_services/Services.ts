/**
 * @fileoverview Services.ts
 * @author Luca Warmenhoven
 * @date Created on Wednesday, October 23 - 18:43
 */

/**
 * Service class.
 * This class is used to represent a service,
 * which can be invoked using `Services.invoke()`.
 */
export class Service<T> {

    /**
     * The services map.
     * This map is used to store all services.
     */
    private static services: Map<string, Service<any>> = new Map<string, Service<any>>();

    /**
     * The descriptor of the service.
     * This descriptor is used to identify and invoke the service.
     */
    public descriptor: string;

    /**
     * Create a new service.
     * @param descriptor the descriptor of the service.
     */
    constructor(descriptor: string) {
        this.descriptor = descriptor;
    }

    /**
     * Invoke the service.
     */
    // @ts-ignore
    public invoke(params: T): void {
        throw new Error('Not implemented');
    }

    /**
     * Register a service.
     * @param service the service to register.
     */
    public static register(service: Service<any>): void {
        console.log('Registering service:', service.descriptor);
        Service.services.set(service.descriptor, service);
    }

    /**
     * Invokes the service with the given descriptor.
     * @param descriptor The descriptor of the service.
     * @param params The parameters to pass to the service.
     */
    public static invoke(descriptor: string, params: any): void {
        console.log('Invoking service:', descriptor, 'with params', params);
        console.log(Service.services.get(descriptor));
        Service.services.get(descriptor)?.invoke(params);
    }
}
