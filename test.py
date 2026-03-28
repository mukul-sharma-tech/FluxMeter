# import numpy as np
# import matplotlib.pyplot as plt

# def get_vortex_field(X, Y, vortex_center, strength_suck, strength_swirl):
#     """
#     Calculates the 2D velocity field (U, V) for a single vortex.
    
#     Args:
#         X (np.array): 2D grid of x-coordinates
#         Y (np.array): 2D grid of y-coordinates
#         vortex_center (tuple): (x0, y0) coordinates of the vortex center
#         strength_suck (float): Strength of the radial pull (negative pulls in)
#         strength_swirl (float): Strength of the tangential spin (positive = counter-clockwise)
        
#     Returns:
#         (np.array, np.array): U (x-velocities) and V (y-velocities)
#     """
    
#     # Get the center coordinates
#     x0, y0 = vortex_center
    
#     # Calculate the distance (r) from every grid point to the vortex center
#     # r_squared is (x - x0)^2 + (y - y0)^2
#     r_squared = (X - x0)**2 + (Y - y0)**2
    
#     # --- Avoid Division by Zero ---
#     # This is a critical step. At the exact center (r=0), the velocity
#     # would be infinite (1/0). We add a tiny "core" (epsilon) to prevent this.
#     # This is a standard "softening" technique in physics simulations.
#     epsilon = 1e-3  # A small "softening" core
#     r_squared = np.maximum(r_squared, epsilon**2) # Don't let r^2 be zero
#     r = np.sqrt(r_squared)

#     # --- Calculate Velocity Components ---
    
#     # 1. Radial "Suck" Component (pulls toward the center)
#     # The direction is simply the vector from the point (x,y) to the center (x0, y0)
#     # Vector = (x0 - X, y0 - Y)
#     # We normalize it by dividing by r, then multiply by strength.
#     # The (1/r) term is characteristic of a point source (like gravity).
#     U_suck = strength_suck * (X - x0) / r
#     V_suck = strength_suck * (Y - y0) / r
    
#     # 2. Tangential "Swirl" Component (orbits the center)
#     # The direction is perpendicular to the radial vector.
#     # If radial vector is (dx, dy), perpendicular is (-dy, dx).
#     # dx = (X - x0), dy = (Y - y0)
#     # Perpendicular vector = (-(Y - y0), (X - x0))
#     U_swirl = strength_swirl * -(Y - y0) / r
#     V_swirl = strength_swirl * (X - x0) / r

#     # --- Combine Components ---
#     # The total velocity is just the sum of the two components.
#     U = U_suck + U_swirl
#     V = V_suck + V_swirl
    
#     return U, V

# # --- 1. Set up the Grid ("The Universe") ---
# grid_size = 20
# num_points = 40  # 40x40 grid
# x = np.linspace(-grid_size, grid_size, num_points)
# y = np.linspace(-grid_size, grid_size, num_points)

# # np.meshgrid creates the 2D coordinate matrices
# X, Y = np.meshgrid(x, y)

# # --- 2. Define the Vortex ---
# vortex_center = (0, 0)
# strength_suck = -1.5  # Negative value pulls particles IN
# strength_swirl = 2.0   # Positive value spins counter-clockwise

# # --- 3. Calculate the Velocity Field ---
# U, V = get_vortex_field(X, Y, vortex_center, strength_suck, strength_swirl)

# # --- 4. Plot the Result ---
# plt.figure(figsize=(10, 8))
# # 'quiver' is the specific plot type for vector fields
# plt.quiver(X, Y, U, V, color='blue', alpha=0.7)
# # Plot the vortex center as a red dot
# plt.plot(vortex_center[0], vortex_center[1], 'ro', markersize=10, label='Vortex Center')
# plt.title('Velocity Field of a Single "Sucking" Vortex')
# plt.xlabel('X Coordinate')
# plt.ylabel('Y Coordinate')
# plt.legend()
# plt.axis('equal') # Ensures x and y axes are scaled the same
# plt.grid(True, linestyle='--', alpha=0.5)
# plt.show()





# import numpy as np
# import matplotlib.pyplot as plt

# def get_vortex_field(X, Y, vortex_center, strength_suck, strength_swirl):
#     """
#     Calculates the 2D velocity field (U, V) for a single vortex.
#     (This is the same function as before)
#     """
#     x0, y0 = vortex_center
#     r_squared = (X - x0)**2 + (Y - y0)**2
#     epsilon = 1e-3
#     r_squared = np.maximum(r_squared, epsilon**2)
#     r = np.sqrt(r_squared)
    
#     # Radial "Suck" Component
#     U_suck = strength_suck * (X - x0) / r
#     V_suck = strength_suck * (Y - y0) / r
    
#     # Tangential "Swirl" Component
#     U_swirl = strength_swirl * -(Y - y0) / r
#     V_swirl = strength_swirl * (X - x0) / r
    
#     U = U_suck + U_swirl
#     V = V_suck + V_swirl
    
#     return U, V

# # --- 1. Set up the Grid ("The Universe") ---
# grid_size = 20
# num_points = 40
# x = np.linspace(-grid_size, grid_size, num_points)
# y = np.linspace(-grid_size, grid_size, num_points)
# X, Y = np.meshgrid(x, y)

# # --- 2. Define the Two Vortices ---
# vortex1_center = (-10, 0)
# vortex2_center = (10, 0)

# # Vortex 1: "Universe 1" - sucks in and spins
# U1, V1 = get_vortex_field(X, Y, vortex1_center, 
#                           strength_suck=-2.0,  # Sucking in
#                           strength_swirl=2.0)

# # Vortex 2: "Universe 2" - also sucks in and spins
# # (In a true simulation, it might "push out", but for now,
# # let's just make two "sinks" connected by your tube)
# U2, V2 = get_vortex_field(X, Y, vortex2_center, 
#                           strength_suck=-2.0,  # Sucking in
#                           strength_swirl=2.0)

# # --- 3. Combine the Fields (Principle of Superposition) ---
# # The total field is the sum of the individual fields
# U_total = U1 + U2
# V_total = V1 + V2

# # --- 4. Define the "Wormhole" Channel (Your Hypothesis) ---
# channel_width = 2.0  # How "wide" the channel is (y-direction)
# channel_speed = 10.0 # How fast the particle travels inside it

# # Create a "mask" for the channel. This is a 2D boolean grid.
# # It's "True" for any point *inside* the channel's boundaries.
# channel_mask = (Y > -channel_width) & \
#                (Y < channel_width) & \
#                (X > vortex1_center[0]) & \
#                (X < vortex2_center[0])

# # --- 5. Apply the Wormhole Physics ---
# # This is the key! We "override" the physics inside the channel.
# # We set the U (x-velocity) to a high constant speed.
# # We set the V (y-velocity) to zero, so it's a straight tube.
# U_total[channel_mask] = channel_speed
# V_total[channel_mask] = 0.0

# # --- 6. Plot the Result ---
# plt.figure(figsize=(16, 9))
# # Plot the combined field
# plt.quiver(X, Y, U_total, V_total, color='blue', alpha=0.7)
# # Plot the vortex centers
# plt.plot(vortex1_center[0], vortex1_center[1], 'ro', markersize=10, label='Vortex 1 (Entry)')
# plt.plot(vortex2_center[0], vortex2_center[1], 'go', markersize=10, label='Vortex 2 (Exit)')

# # Highlight the wormhole channel
# plt.fill_betweenx(y=[-channel_width, channel_width], 
#                   x1=vortex1_center[0], 
#                   x2=vortex2_center[0], 
#                   color='red', alpha=0.2, label='"Wormhole" Channel')

# plt.title('Velocity Field for Fluidic Wormhole Hypothesis')
# plt.xlabel('X Coordinate')
# plt.ylabel('Y Coordinate')
# plt.legend(loc='upper left')
# plt.axis('equal')
# plt.grid(True, linestyle='--', alpha=0.5)
# plt.show()



import numpy as np
import matplotlib.pyplot as plt
from scipy.interpolate import interpn # <-- This is our new tool

# --- (FUNCTIONS FROM PREVIOUS STEPS) ---

def get_vortex_field(X, Y, vortex_center, strength_suck, strength_swirl):
    """Calculates the 2D velocity field (U, V) for a single vortex."""
    x0, y0 = vortex_center
    r_squared = (X - x0)**2 + (Y - y0)**2
    epsilon = 1e-3
    r_squared = np.maximum(r_squared, epsilon**2)
    r = np.sqrt(r_squared)
    
    U_suck = strength_suck * (X - x0) / r
    V_suck = strength_suck * (Y - y0) / r
    U_swirl = strength_swirl * -(Y - y0) / r
    V_swirl = strength_swirl * (X - x0) / r
    
    return U_suck + U_swirl, V_suck + V_swirl

def get_combined_field(X, Y, with_wormhole=True):
    """
    Generates the entire velocity field, now with a switch
    to turn the wormhole on or off.
    """
    # --- 1. Define the Two Vortices ---
    vortex1_center = (-10, 0)
    vortex2_center = (10, 0)
    
    U1, V1 = get_vortex_field(X, Y, vortex1_center, strength_suck=-2.0, strength_swirl=2.0)
    U2, V2 = get_vortex_field(X, Y, vortex2_center, strength_suck=-2.0, strength_swirl=2.0)
    
    U_total = U1 + U2
    V_total = V1 + V2

    # --- 2. Define and Apply the "Wormhole" Channel ---
    if with_wormhole:
        channel_width = 2.0
        channel_speed = 10.0
        
        channel_mask = (Y > -channel_width) & \
                       (Y < channel_width) & \
                       (X > vortex1_center[0]) & \
                       (X < vortex2_center[0])
        
        U_total[channel_mask] = channel_speed
        V_total[channel_mask] = 0.0
        
    return U_total, V_total

# --- 1. SET UP THE SIMULATION ---

# --- Grid ("The Universe") ---
grid_size = 20
num_points = 40 # We use a 40x40 grid
# Create the 1D coordinate arrays
x_coords = np.linspace(-grid_size, grid_size, num_points)
y_coords = np.linspace(-grid_size, grid_size, num_points)
# Create the 2D coordinate matrices
X, Y = np.meshgrid(x_coords, y_coords)
# We need this for the interpolator
points = (y_coords, x_coords) # Note: (y, x) format is expected by interpn

# --- Particle ---
class Particle:
    def __init__(self, start_pos):
        self.pos = np.array(start_pos, dtype=float)
        self.path = [np.copy(self.pos)] # History of all positions
        
    def update(self, U_field, V_field, dt):
        """Update the particle's position based on the velocity field."""
        
        # --- Interpolation ---
        # Find the precise velocity (U, V) at the particle's current position
        # We must feed the interpolator the (y, x) position
        point_to_query = [self.pos[1], self.pos[0]] 
        
        try:
            # Get the interpolated x-velocity
            vel_u = interpn(points, U_field, point_to_query, method='linear')
            # Get the interpolated y-velocity
            vel_v = interpn(points, V_field, point_to_query, method='linear')
        except ValueError:
            # Particle has left the grid, stop the simulation
            return False 

        # --- Euler Integration (The Physics Step) ---
        # new_position = old_position + velocity * time_step
        self.pos[0] += vel_u[0] * dt
        self.pos[1] += vel_v[0] * dt
        
        # Save the new position to its path history
        self.path.append(np.copy(self.pos))
        return True

# --- Simulation Parameters ---
dt = 0.1             # Time step
num_steps = 1000     # Max steps
start_pos = [-8, 2]  # Starting position (near vortex 1)

# --- 2. RUN THE EXPERIMENTS ---

# --- Experiment 1: With Your Wormhole ---
particle_1 = Particle(start_pos)
U_wormhole, V_wormhole = get_combined_field(X, Y, with_wormhole=True)

for _ in range(num_steps):
    if not particle_1.update(U_wormhole, V_wormhole, dt):
        print("Particle 1 left the grid.")
        break
path_1 = np.array(particle_1.path) # Convert path to a NumPy array for plotting

# --- Experiment 2: Control (No Wormhole) ---
particle_2 = Particle(start_pos)
U_control, V_control = get_combined_field(X, Y, with_wormhole=False)

for _ in range(num_steps):
    if not particle_2.update(U_control, V_control, dt):
        print("Particle 2 left the grid.")
        break
path_2 = np.array(particle_2.path)

# --- 3. PLOT THE RESULTS (THE "PROOF") ---

fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(20, 10))
fig.suptitle('Simulation Results: Your Hypothesis vs. Control', fontsize=18)

# --- Plot 1: With Wormhole ---
ax1.set_title("TEST: With Wormhole (Hypothesis = TRUE)")
ax1.quiver(X, Y, U_wormhole, V_wormhole, color='blue', alpha=0.3)
ax1.plot(path_1[:, 0], path_1[:, 1], 'r-', linewidth=2.5, label='Particle Path') # Plot path
ax1.plot(start_pos[0], start_pos[1], 'ko', markersize=8, label='Start') # Start
ax1.plot(path_1[-1, 0], path_1[-1, 1], 'kx', markersize=10, label='End') # End
ax1.set_xlabel('X Coordinate')
ax1.set_ylabel('Y Coordinate')
ax1.legend()
ax1.axis('equal')
ax1.set_xlim([-grid_size, grid_size])
ax1.set_ylim([-grid_size, grid_size])

# --- Plot 2: Control (No Wormhole) ---
ax2.set_title("CONTROL: Without Wormhole (Hypothesis = FALSE)")
ax2.quiver(X, Y, U_control, V_control, color='blue', alpha=0.3)
ax2.plot(path_2[:, 0], path_2[:, 1], 'r-', linewidth=2.5, label='Particle Path') # Plot path
ax2.plot(start_pos[0], start_pos[1], 'ko', markersize=8, label='Start') # Start
ax2.plot(path_2[-1, 0], path_2[-1, 1], 'kx', markersize=10, label='End') # End
ax2.set_xlabel('X Coordinate')
ax2.set_ylabel('Y Coordinate')
ax2.legend()
ax2.axis('equal')
ax2.set_xlim([-grid_size, grid_size])
ax2.set_ylim([-grid_size, grid_size])

plt.show()