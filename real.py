# import numpy as np
# import matplotlib.pyplot as plt

# # --- 1. The New V2.0 Particle Class ---
# class DynamicParticle:
#     def __init__(self, start_pos, start_vel=(0, 0)):
#         """
#         Initializes a particle with its own position and velocity.
#         """
#         self.pos = np.array(start_pos, dtype=float)
#         self.vel = np.array(start_vel, dtype=float)
#         self.path = [np.copy(self.pos)] # History of all positions
        
#     def update(self, acceleration, dt):
#         """
#         Updates the particle's state using a physics integration step.
        
#         Args:
#             acceleration (np.array): The acceleration (ax, ay) from the force field.
#             dt (float): The small time step (e.g., 0.1 seconds).
#         """
        
#         # --- Physics Integration (Euler-Cromer method) ---
        
#         # 1. Update velocity based on acceleration
#         #    v_new = v_old + (a * dt)
#         self.vel += acceleration * dt
        
#         # 2. Update position based on the *new* velocity
#         #    p_new = p_old + (v_new * dt)
#         self.pos += self.vel * dt
        
#         # 3. Store the new position
#         self.path.append(np.copy(self.pos))

# # --- 2. The New V2.0 Force Function ---
# def get_vortex_acceleration(particle_pos, vortex_center, strength_suck, strength_swirl):
#     """
#     Calculates the acceleration (ax, ay) for a particle at a given position,
#     caused by a single vortex.
    
#     This function calculates FORCE, not velocity.
#     """
#     x, y = particle_pos
#     x0, y0 = vortex_center
    
#     # Calculate distance vector (dx, dy)
#     dx = x - x0
#     dy = y - y0
    
#     r_squared = dx**2 + dy**2
#     epsilon = 0.1 # Softening core (prevents 1/0)
#     r_squared = np.maximum(r_squared, epsilon**2)
#     r = np.sqrt(r_squared)

#     # --- Calculate Acceleration Components ---
#     # We use a 1/r^2 "gravity" model, which is a strong force.
#     # F = G*M/r^2. We'll combine (G*M) into our "strength" parameter.
    
#     # 1. Radial "Suck" Acceleration (pulls toward the center)
#     #    Direction vector is (-dx, -dy) (or (x0-x, y0-y))
#     #    We normalize it (-dx/r, -dy/r) and multiply by force.
#     force_magnitude_suck = strength_suck / r_squared
#     ax_suck = force_magnitude_suck * (-dx / r)
#     ay_suck = force_magnitude_suck * (-dy / r)

#     # 2. Tangential "Swirl" Acceleration (adds rotational energy)
#     #    Direction is perpendicular to radial: (-dy, dx)
#     #    We normalize it (-dy/r, dx/r) and multiply by force.
#     force_magnitude_swirl = strength_swirl / r_squared
#     ax_swirl = force_magnitude_swirl * (-dy / r)
#     ay_swirl = force_magnitude_swirl * (dx / r)

#     # Total acceleration is the sum
#     ax = ax_suck + ax_swirl
#     ay = ay_suck + ay_swirl
    
#     return np.array([ax, ay])

# # --- 3. Run a Test Simulation ---

# # --- Simulation Parameters ---
# dt = 0.05            # Time step (smaller is more accurate)
# num_steps = 1000     # Max steps
# start_pos = [10, 10] # Start further away

# # --- Initialize Objects ---
# particle = DynamicParticle(start_pos, start_vel=(0, -2)) # Give it a little push
# vortex_center = (0, 0)
# strength_suck = 10.0  # Force pulling IN
# strength_swirl = 10.0 # Force swirling around

# # --- The Simulation Loop ---
# for _ in range(num_steps):
#     # 1. Calculate the force/acceleration on the particle at its *current* position
#     accel = get_vortex_acceleration(particle.pos, vortex_center, 
#                                     strength_suck, strength_swirl)
    
#     # 2. Update the particle's state (vel, pos)
#     particle.update(accel, dt)
    
#     # Stop if it gets too close to the center
#     if np.linalg.norm(particle.pos - vortex_center) < 0.2:
#         print("Particle reached the core.")
#         break
        
# # --- 4. Plot the Result ---
# path = np.array(particle.path) # Convert path to a NumPy array

# # Calculate the speed at each step
# velocities = np.linalg.norm(np.diff(path, axis=0) / dt, axis=1)

# fig, (ax1, ax2) = plt.subplots(2, 1, figsize=(10, 15), 
#                               gridspec_kw={'height_ratios': [2, 1]})
# fig.suptitle('V2.0 Simulation: Particle with Dynamic Energy', fontsize=16)

# # --- Plot 1: The Path ---
# ax1.plot(path[:, 0], path[:, 1], 'r-', label='Particle Path')
# ax1.plot(start_pos[0], start_pos[1], 'go', markersize=10, label='Start')
# ax1.plot(vortex_center[0], vortex_center[1], 'bo', markersize=12, label='Vortex Core')
# ax1.set_title('Path of an Accelerating Particle')
# ax1.set_xlabel('X Coordinate')
# ax1.set_ylabel('Y Coordinate')
# ax1.legend()
# ax1.axis('equal')
# ax1.grid(True, linestyle='--', alpha=0.5)

# # --- Plot 2: The Speed ---
# ax2.plot(velocities, 'b-', label='Particle Speed')
# ax2.set_title('Proof of Acceleration (Your Hypothesis)')
# ax2.set_xlabel('Time Step')
# ax2.set_ylabel('Speed (magnitude of velocity)')
# ax2.legend()
# ax2.grid(True)

# plt.tight_layout(rect=[0, 0.03, 1, 0.95])
# plt.show()

# import numpy as np
# import matplotlib.pyplot as plt

# # --- 1. The V2.0 Particle Class (Now with STATE) ---
# class DynamicParticle:
#     def __init__(self, start_pos, start_vel=(0, 0)):
#         self.pos = np.array(start_pos, dtype=float)
#         self.vel = np.array(start_vel, dtype=float)
#         self.path = [np.copy(self.pos)]
#         self.state = 'SPIRALING_IN' # New state machine
        
#     def update(self, acceleration, dt):
#         self.vel += acceleration * dt
#         self.pos += self.vel * dt
#         self.path.append(np.copy(self.pos))

# # --- 2. The V2.0 Force Function (Same as before) ---
# def get_vortex_acceleration(particle_pos, vortex_center, strength_suck, strength_swirl):
#     """Calculates the acceleration (ax, ay) from a single vortex."""
#     dx = particle_pos[0] - vortex_center[0]
#     dy = particle_pos[1] - vortex_center[1]
    
#     r_squared = dx**2 + dy**2
#     epsilon = 0.1
#     r_squared = np.maximum(r_squared, epsilon**2)
#     r = np.sqrt(r_squared)

#     force_magnitude_suck = strength_suck / r_squared
#     ax_suck = force_magnitude_suck * (-dx / r)
#     ay_suck = force_magnitude_suck * (-dy / r)

#     force_magnitude_swirl = strength_swirl / r_squared
#     ax_swirl = force_magnitude_swirl * (-dy / r)
#     ay_swirl = force_magnitude_swirl * (dx / r)
    
#     return np.array([ax_suck + ax_swirl, ay_suck + ay_swirl])

# # --- 3. The New V2.0 Simulation Loop (with States) ---

# # --- Simulation Parameters ---
# dt = 0.05
# num_steps = 3000
# start_pos = [15, 15] # Start further away

# # --- Universe Parameters ---
# # Vortex 1 (Entry)
# vortex1_center = np.array([10, 0])
# vortex1_suck = 20.0     # Pulls IN
# vortex1_swirl = 20.0
# throat1_radius = 0.5    # The "trigger" radius

# # Vortex 2 (Exit)
# vortex2_center = np.array([-10, 0])
# vortex2_suck = -20.0    # Pushes OUT (negative strength)
# vortex2_swirl = 20.0
# throat2_radius = 2.0    # The "arrival" radius

# # Channel Parameters
# launch_speed = 30.0     # The "max speed" you described
# no_force = np.array([0.0, 0.0]) # Zero-G in the channel

# # --- Initialize Objects ---
# particle = DynamicParticle(start_pos)

# # --- The Simulation Loop ---
# for i in range(num_steps):
    
#     # This is the "brain" of the simulation, it decides what physics to apply
    
#     if particle.state == 'SPIRALING_IN':
#         # Calculate distance to the entry throat
#         dist_to_v1 = np.linalg.norm(particle.pos - vortex1_center)
        
#         # --- THE LAUNCH EVENT ---
#         if dist_to_v1 < throat1_radius:
#             print(f"STEP {i}: --- PARTICLE ENTERED THROAT 1 ---")
#             print(f"         Previous speed: {np.linalg.norm(particle.vel):.2f}")
            
#             # 1. Calculate the launch direction
#             #    Vector from Throat 1 to Throat 2
#             launch_vector = vortex2_center - vortex1_center
            
#             # 2. Normalize the vector (make its length 1)
#             launch_direction = launch_vector / np.linalg.norm(launch_vector)
            
#             # 3. Set the particle's velocity (your "max speed shoot")
#             particle.vel = launch_direction * launch_speed
            
#             # 4. Update the particle's state
#             particle.state = 'COASTING'
#             print(f"         New speed: {np.linalg.norm(particle.vel):.2f}")

#         else:
#             # Not in the throat yet, just apply normal vortex physics
#             accel = get_vortex_acceleration(particle.pos, vortex1_center,
#                                             vortex1_suck, vortex1_swirl)
#             particle.update(accel, dt)

#     elif particle.state == 'COASTING':
#         # Apply ZERO force. Particle just "coasts" at launch speed.
#         particle.update(no_force, dt)
        
#         # Check if it has arrived at Vortex 2
#         dist_to_v2 = np.linalg.norm(particle.pos - vortex2_center)
#         if dist_to_v2 < throat2_radius:
#             print(f"STEP {i}: --- PARTICLE ARRIVED AT THROAT 2 ---")
#             particle.state = 'EXITING'

#     elif particle.state == 'EXITING':
#         # Now it's in the grip of Vortex 2, which pushes OUT
#         accel = get_vortex_acceleration(particle.pos, vortex2_center,
#                                         vortex2_suck, vortex2_swirl)
#         particle.update(accel, dt)
        
#         # Stop sim if it gets far away
#         if np.linalg.norm(particle.pos) > 50:
#             print(f"STEP {i}: --- PARTICLE EXITED THE SYSTEM ---")
#             break

# # --- 4. Plot the Full Journey ---
# path = np.array(particle.path)
# velocities = np.linalg.norm(np.diff(path, axis=0) / dt, axis=1)

# fig, (ax1, ax2) = plt.subplots(2, 1, figsize=(10, 16),
#                               gridspec_kw={'height_ratios': [2, 1]})
# fig.suptitle('V2.0 Simulation: Full Journey (Your Hypothesis)', fontsize=16)

# # --- Plot 1: The Path ---
# ax1.plot(path[:, 0], path[:, 1], 'r-', label='Particle Path')
# ax1.plot(start_pos[0], start_pos[1], 'go', markersize=10, label='Start')
# # Plot Vortex 1 (Entry)
# ax1.plot(vortex1_center[0], vortex1_center[1], 'bo', markersize=12, label='Vortex 1 (Entry)')
# ax1.add_patch(plt.Circle(vortex1_center, throat1_radius, color='b', alpha=0.2, label='Throat 1 (Trigger)'))
# # Plot Vortex 2 (Exit)
# ax1.plot(vortex2_center[0], vortex2_center[1], 'mo', markersize=12, label='Vortex 2 (Exit)')
# ax1.add_patch(plt.Circle(vortex2_center, throat2_radius, color='m', alpha=0.2, label='Throat 2 (Arrival)'))

# ax1.set_title('Path (Spiral In -> Launch -> Coast -> Spiral Out)')
# ax1.set_xlabel('X Coordinate')
# ax1.set_ylabel('Y Coordinate')
# ax1.legend(loc='upper left', fontsize='small')
# ax1.axis('equal')
# ax1.grid(True, linestyle='--', alpha=0.5)

# # --- Plot 2: The Speed ---
# ax2.plot(velocities, 'b-', label='Particle Speed')
# ax2.set_title('Speed Over Time (The "Launch" is Clearly Visible)')
# ax2.set_xlabel('Time Step')
# ax2.set_ylabel('Speed')
# ax2.legend()
# ax2.grid(True)
# # Find all time steps where the particle was at launch speed
# launch_event_indices = np.where(velocities > launch_speed * 0.99)[0]

# if len(launch_event_indices) > 0:
#     # If the list is NOT empty, find the first event and plot the line
#     first_launch_step = launch_event_indices[0]
#     ax2.axvline(x=first_launch_step, color='r', linestyle='--', label='Launch Event')
#     print(f"--- Launch event successfully occurred at step {first_launch_step} ---")
# else:
#     # If the list IS empty, print a warning instead of crashing
#     print("--- WARNING: Particle never reached the throat or launch speed. ---")

# plt.tight_layout(rect=[0, 0.03, 1, 0.95])
# plt.show()
import numpy as np
import matplotlib.pyplot as plt
from matplotlib.animation import FuncAnimation
from IPython.display import HTML # For displaying in notebooks

# --- 1. The V2.0 Particle Class (with STATE) ---
class DynamicParticle:
    def __init__(self, start_pos, start_vel=(0, 0)):
        self.pos = np.array(start_pos, dtype=float)
        self.vel = np.array(start_vel, dtype=float)
        self.path = [np.copy(self.pos)]
        self.state = 'SPIRALING_IN'
        
    def update(self, acceleration, dt):
        self.vel += acceleration * dt
        self.pos += self.vel * dt
        self.path.append(np.copy(self.pos))

# --- 2. The V2.0 Force Function ---
def get_vortex_acceleration(particle_pos, vortex_center, strength_suck, strength_swirl):
    dx = particle_pos[0] - vortex_center[0]
    dy = particle_pos[1] - vortex_center[1]
    r_squared = dx**2 + dy**2
    epsilon = 0.1
    r_squared = np.maximum(r_squared, epsilon**2)
    r = np.sqrt(r_squared)
    force_magnitude_suck = strength_suck / r_squared
    ax_suck = force_magnitude_suck * (-dx / r)
    ay_suck = force_magnitude_suck * (-dy / r)
    force_magnitude_swirl = strength_swirl / r_squared
    ax_swirl = force_magnitude_swirl * (-dy / r)
    ay_swirl = force_magnitude_swirl * (dx / r)
    return np.array([ax_suck + ax_swirl, ay_suck + ay_swirl])

# --- 3. The V2.0 Simulation Loop (with States) ---

print("--- Running simulation to generate path data... ---")

# --- Simulation Parameters ---
dt = 0.05
num_steps = 3000
start_pos = [15, 15]

# --- Universe Parameters ---
vortex1_center = np.array([10, 0])
vortex1_suck = 40.0     # Strong "gravity" for capture
vortex1_swirl = 20.0
throat1_radius = 0.5
vortex2_center = np.array([-10, 0])
vortex2_suck = -20.0    # Pushes OUT
vortex2_swirl = 20.0
throat2_radius = 2.0
launch_speed = 30.0
no_force = np.array([0.0, 0.0])

# --- Initialize Objects ---
particle = DynamicParticle(start_pos)

# --- The Simulation Loop ---
for i in range(num_steps):
    if particle.state == 'SPIRALING_IN':
        dist_to_v1 = np.linalg.norm(particle.pos - vortex1_center)
        if dist_to_v1 < throat1_radius:
            print(f"STEP {i}: --- PARTICLE ENTERED THROAT 1 ---")
            launch_vector = vortex2_center - vortex1_center
            launch_direction = launch_vector / np.linalg.norm(launch_vector)
            particle.vel = launch_direction * launch_speed
            particle.state = 'COASTING'
        else:
            accel = get_vortex_acceleration(particle.pos, vortex1_center,
                                            vortex1_suck, vortex1_swirl)
            particle.update(accel, dt)
    elif particle.state == 'COASTING':
        particle.update(no_force, dt)
        dist_to_v2 = np.linalg.norm(particle.pos - vortex2_center)
        if dist_to_v2 < throat2_radius:
            print(f"STEP {i}: --- PARTICLE ARRIVED AT THROAT 2 ---")
            particle.state = 'EXITING'
    elif particle.state == 'EXITING':
        accel = get_vortex_acceleration(particle.pos, vortex2_center,
                                        vortex2_suck, vortex2_swirl)
        particle.update(accel, dt)
        if np.linalg.norm(particle.pos) > 50:
            print(f"STEP {i}: --- PARTICLE EXITED THE SYSTEM ---")
            break

# --- Convert path to a NumPy array for easier slicing ---
path = np.array(particle.path)
print(f"--- Simulation complete. Total path steps: {len(path)} ---")


#
# =======================================================================
# --- 4. NEW ANIMATION CODE ---
# =======================================================================
#

print("--- Preparing animation... ---")

# --- Animation Parameters ---
# The path has many steps. We can skip frames to make the animation faster.
# skip_rate = 1  (Slower, high-quality)
# skip_rate = 10 (Faster, good overview)
skip_rate = 10
path_for_animation = path[::skip_rate]
num_frames = len(path_for_animation)
tail_length = 50 # How many past steps to show as a "comet tail"

# --- Set up the plot ("The Canvas") ---
fig_anim, ax_anim = plt.subplots(figsize=(10, 7))

# Set the x and y limits for the "camera"
max_range = np.max(np.abs(path)) + 5 # Find max range and add a buffer
ax_anim.set_xlim(-max_range, max_range)
ax_anim.set_ylim(-max_range, max_range)
ax_anim.set_aspect('equal')
ax_anim.set_title('Wormhole V2.0 Simulation: The Journey')
ax_anim.grid(True, linestyle='--', alpha=0.3)

# --- Draw the Static Background ---
# Plot Vortex 1 (Entry)
ax_anim.plot(vortex1_center[0], vortex1_center[1], 'bo', markersize=12, label='Vortex 1 (Entry)')
ax_anim.add_patch(plt.Circle(vortex1_center, throat1_radius, color='b', alpha=0.2, label='Throat 1'))
# Plot Vortex 2 (Exit)
ax_anim.plot(vortex2_center[0], vortex2_center[1], 'mo', markersize=12, label='Vortex 2 (Exit)')
ax_anim.add_patch(plt.Circle(vortex2_center, throat2_radius, color='m', alpha=0.2, label='Throat 2'))
ax_anim.legend(loc='upper left', fontsize='small')

# --- Initialize the "Actors" ---
# 'line' is the particle itself (a red dot)
# The comma is important! It unpacks a list of 1.
line, = ax_anim.plot([], [], 'ro', markersize=8) 
# 'tail' is the "comet tail"
tail, = ax_anim.plot([], [], 'r-', alpha=0.5, lw=1)

# --- Initialization Function ---
# Called once at the beginning to draw a blank frame
def init():
    line.set_data([], [])
    tail.set_data([], [])
    return line, tail

# --- The Animation Function ---
# This is the main function, called for every frame.
# 'i' is the frame number (from 0 to num_frames)
def animate(i):
    # Set the particle's (x, y) position
    current_pos = path_for_animation[i]
    line.set_data([current_pos[0]], [current_pos[1]])

    # Set the tail's (x, y) data
    # Get the last 'tail_length' points from the path up to this frame
    start_of_tail = max(0, i - tail_length)
    tail_path = path_for_animation[start_of_tail:i]
    
    # We must feed the plot x-values and y-values separately
    tail_x = tail_path[:, 0]
    tail_y = tail_path[:, 1]
    tail.set_data(tail_x, tail_y)

    return line, tail

# --- Create and Display the Animation ---
# Create the animation object
# 'frames' is the total number of times to call 'animate'
# 'init_func' is the function to call at the start
# 'blit=True' makes it run faster by only redrawing what changed
anim = FuncAnimation(fig_anim, animate, init_func=init,
                       frames=num_frames, interval=20, blit=True)

# Display the animation
# This will convert the animation to JavaScript/HTML
# Note: This works best in environments like Jupyter or VS Code notebooks
# If running as a plain .py script, you might see a blank window
# or might need to save the file instead.
print("--- Animation complete. Displaying... ---")
plt.close(fig_anim) # Close the static plot window
HTML(anim.to_jshtml())

# If you want to save the animation as a video file (e.g., MP4):
# Requires having 'ffmpeg' installed on your system
# anim.save('wormhole_animation.mp4', writer='ffmpeg', fps=30)
# print("--- Animation saved as wormhole_animation.mp4 ---")